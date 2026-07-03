import Investor from '#models/investor'
import { loginValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import InvestorTransformer from '#transformers/investor_transformer'

export default class AccessTokensController {
  /**
   * POST /auth/login
   */
  async store({ request, response, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const investor = await Investor.query().where('email', email).first()
    if (!investor) {
      return response.unauthorized({
        errors: [{ message: 'Invalid credentials' }],
      })
    }

    if (!investor.isActive) {
      return response.forbidden({
        errors: [{ message: 'account deactivated' }],
      })
    }

    try {
      // Verify credentials using Lucid AuthFinder
      await Investor.verifyCredentials(email, password)
    } catch {
      return response.unauthorized({
        errors: [{ message: 'Invalid credentials' }],
      })
    }

    const token = await Investor.accessTokens.create(investor)

    return serialize({
      user: InvestorTransformer.transform(investor),
      token: token.value!.release(),
    })
  }

  /**
   * GET /auth/me
   */
  async show({ auth, serialize }: HttpContext) {
    const investor = auth.getUserOrFail()
    return serialize({
      user: InvestorTransformer.transform(investor),
    })
  }

  /**
   * POST /auth/logout
   */
  async destroy({ auth }: HttpContext) {
    const investor = auth.getUserOrFail()
    if (investor.currentAccessToken) {
      await Investor.accessTokens.delete(investor, investor.currentAccessToken.identifier)
    }

    return {
      message: 'Logged out successfully',
    }
  }
}
