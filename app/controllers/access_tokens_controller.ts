import User from '#models/user'
import { loginValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class AccessTokensController {
  /**
   * POST /auth/login
   */
  async store({ request, response, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.query().where('email', email).first()
    if (!user) {
      return response.unauthorized({
        errors: [{ message: 'Invalid credentials' }],
      })
    }

    if (!user.isActive) {
      return response.forbidden({
        errors: [{ message: 'account deactivated' }],
      })
    }

    try {
      // Verify credentials using Lucid AuthFinder
      await User.verifyCredentials(email, password)
    } catch {
      return response.unauthorized({
        errors: [{ message: 'Invalid credentials' }],
      })
    }

    const token = await User.accessTokens.create(user)

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
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
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return {
      message: 'Logged out successfully',
    }
  }
}
