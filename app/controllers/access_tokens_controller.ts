import User from '#models/user'
import RefreshToken from '#models/refresh_token'
import { loginValidator, refreshValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import { randomBytes, createHash } from 'node:crypto'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import activityService from '#services/activity_service'

export default class AccessTokensController {
  /**
   * Helper to generate a new cryptographically secure refresh token
   */
  private generateRefreshTokenRaw(): string {
    return randomBytes(32).toString('hex')
  }

  /**
   * Helper to compute SHA-256 hash of a raw token string
   */
  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex')
  }

  /**
   * Helper to create and persist a new refresh token for a user
   */
  private async createRefreshToken(userId: string): Promise<string> {
    const rawToken = this.generateRefreshTokenRaw()
    const tokenHash = this.hashToken(rawToken)

    await RefreshToken.create({
      id: randomUUID(),
      userId,
      tokenHash,
      expiresAt: DateTime.now().plus({ days: 14 }),
      createdAt: DateTime.now(),
      revokedAt: null,
    })

    return rawToken
  }

  /**
   * POST /auth/login
   */
  async store({ request, response, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.query().where('email', email).first()
    if (!user) {
      activityService.log({
        userId: null,
        action: 'AUTH_LOGIN_FAILED',
        metadata: { email },
      })
      return response.unauthorized({
        errors: [{ message: 'Invalid credentials' }],
      })
    }

    if (!user.isActive) {
      activityService.log({
        userId: user.id,
        action: 'AUTH_LOGIN_FAILED',
        metadata: { email, name: user.name, reason: 'deactivated', actorName: user.name },
      })
      return response.forbidden({
        errors: [{ message: 'account deactivated' }],
      })
    }

    try {
      await User.verifyCredentials(email, password)
    } catch {
      activityService.log({
        userId: user.id,
        action: 'AUTH_LOGIN_FAILED',
        metadata: { email, name: user.name, reason: 'invalid_password', actorName: user.name },
      })
      return response.unauthorized({
        errors: [{ message: 'Invalid credentials' }],
      })
    }

    // 1. Generate access token (7 days - set on User model configuration)
    const accessToken = await User.accessTokens.create(user)

    // 2. Generate and persist refresh token (14 days)
    const refreshToken = await this.createRefreshToken(user.id)

    activityService.log({
      userId: user.id,
      action: 'AUTH_LOGIN',
      metadata: { email: user.email, name: user.name, actorName: user.name },
    })

    return serialize({
      user: UserTransformer.transform(user),
      accessToken: accessToken.value!.release(),
      refreshToken,
    })
  }

  /**
   * POST /auth/refresh
   */
  async refresh({ request, response }: HttpContext) {
    const { refreshToken: rawRefreshToken } = await request.validateUsing(refreshValidator)
    const tokenHash = this.hashToken(rawRefreshToken)

    // Find the token in the database
    const dbToken = await RefreshToken.query().where('tokenHash', tokenHash).first()

    if (!dbToken) {
      return response.unauthorized({
        errors: [{ message: 'Invalid refresh token' }],
      })
    }

    // Reuse detection: if a revoked refresh token is presented again,
    // treat it as a possible breach and revoke ALL of that user's refresh tokens.
    if (dbToken.revokedAt) {
      await RefreshToken.query()
        .where('userId', dbToken.userId)
        .whereNull('revokedAt')
        .update({ revokedAt: DateTime.now().toSQL() })

      activityService.log({
        userId: dbToken.userId,
        action: 'AUTH_TOKEN_REUSE_DETECTED',
      })

      return response.unauthorized({
        errors: [{ message: 'Refresh token has already been used. Session compromised.' }],
      })
    }

    // Check expiration
    if (DateTime.now() > dbToken.expiresAt) {
      return response.unauthorized({
        errors: [{ message: 'Refresh token has expired' }],
      })
    }

    // Find the associated user
    const user = await User.find(dbToken.userId)
    if (!user || !user.isActive) {
      return response.forbidden({
        errors: [{ message: 'User is inactive or not found' }],
      })
    }

    // Revoke the old token (rotate)
    dbToken.revokedAt = DateTime.now()
    await dbToken.save()

    // Generate new pair
    const nextAccessToken = await User.accessTokens.create(user)
    const nextRefreshToken = await this.createRefreshToken(user.id)

    activityService.log({
      userId: user.id,
      action: 'AUTH_TOKEN_REFRESHED',
      metadata: { actorName: user.name },
    })

    return {
      accessToken: nextAccessToken.value!.release(),
      refreshToken: nextRefreshToken,
    }
  }

  /**
   * GET /auth/me
   */
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    return serialize({
      user: UserTransformer.transform(user),
    })
  }

  /**
   * POST /auth/logout
   */
  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()

    // Delete current access token
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    // Revoke all active refresh tokens for the user
    await RefreshToken.query()
      .where('userId', user.id)
      .whereNull('revokedAt')
      .update({ revokedAt: DateTime.now().toSQL() })

    activityService.log({
      userId: user.id,
      action: 'AUTH_LOGOUT',
      metadata: { name: user.name, actorName: user.name },
    })

    return {
      message: 'Logged out successfully',
    }
  }
}
