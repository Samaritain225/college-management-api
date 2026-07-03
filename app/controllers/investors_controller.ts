import Investor from '#models/investor'
import { createInvestorValidator, updateInvestorValidator } from '#validators/investor'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import InvestorTransformer from '#transformers/investor_transformer'

export default class InvestorsController {
  /**
   * GET /investors
   */
  async index({ bouncer, response, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized access to investor management' })
    }

    // Left join users to include linked user name/email for display
    const investors = await Investor.query()
      .leftJoin('users', 'investors.user_id', 'users.id')
      .select('investors.*')
      .select('users.name as userName')
      .select('users.email as userEmail')
      .orderBy('investors.name', 'asc')

    return serialize({
      investors: InvestorTransformer.transform(investors),
    })
  }

  /**
   * POST /investors
   */
  async store({ request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized to create investors' })
    }

    const currentUser = auth.getUserOrFail()
    const payload = await request.validateUsing(createInvestorValidator)

    const investor = await Investor.create({
      id: randomUUID(),
      name: payload.name,
      agreedContribution: payload.agreedContribution,
      joinedAt: payload.joinedAt ? DateTime.fromISO(payload.joinedAt) : DateTime.now(),
      userId: payload.userId ?? null,
      createdBy: currentUser.id,
    })

    return serialize({
      investor: InvestorTransformer.transform(investor),
    })
  }

  /**
   * PATCH /investors/:id
   */
  async update({ params, request, response, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized to update investors' })
    }

    const investor = await Investor.findOrFail(params.id)
    const payload = await request.validateUsing(updateInvestorValidator)

    investor.merge({
      name: payload.name ?? investor.name,
      agreedContribution: payload.agreedContribution ?? investor.agreedContribution,
      joinedAt: payload.joinedAt ? DateTime.fromISO(payload.joinedAt) : investor.joinedAt,
    })

    await investor.save()

    return serialize({
      investor: InvestorTransformer.transform(investor),
    })
  }
}
