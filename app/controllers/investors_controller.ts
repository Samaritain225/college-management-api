import Investor from '#models/investor'
import { createInvestorValidator, updateInvestorValidator } from '#validators/investor'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import InvestorTransformer from '#transformers/investor_transformer'
import { TABLES } from '#constants/tables'
import activityService from '#services/activity_service'
import { manageUsers } from '#abilities/main'

export default class InvestorsController {
  /**
   * GET /investors
   */
  async index({ bouncer, response, serialize }: HttpContext) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden({ message: 'Unauthorized access to investor management' })
    }

    // Left join users to include linked user name/email for display
    const investors = await Investor.query()
      .leftJoin(TABLES.USERS, `${TABLES.INVESTORS}.user_id`, `${TABLES.USERS}.id`)
      .select(`${TABLES.INVESTORS}.*`)
      .select(`${TABLES.USERS}.name as userName`)
      .select(`${TABLES.USERS}.email as userEmail`)
      .orderBy(`${TABLES.INVESTORS}.name`, 'asc')

    return serialize({
      investors: InvestorTransformer.transform(investors),
    })
  }

  /**
   * POST /investors
   */
  async store({ request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden({ message: 'Unauthorized to create investors' })
    }

    const currentUser = auth.getUserOrFail()
    const payload = await request.validateUsing(createInvestorValidator)

    const investor = await Investor.create({
      id: randomUUID(),
      name: payload.name,
      agreedContribution: payload.agreedContribution ?? 0,
      joinedAt: payload.joinedAt ? DateTime.fromISO(payload.joinedAt) : DateTime.now(),
      userId: payload.userId ?? null,
      createdBy: currentUser.id,
    })

    activityService.log({
      userId: currentUser.id,
      action: 'INVESTOR_CREATE',
      metadata: {
        investorId: investor.id,
        name: investor.name,
        agreedContribution: investor.agreedContribution,
        actorName: currentUser.name,
      },
    })

    return serialize({
      investor: InvestorTransformer.transform(investor),
    })
  }

  /**
   * PATCH /investors/:id
   */
  async update({ params, request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies(manageUsers)) {
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

    activityService.log({
      userId: auth.getUserOrFail().id,
      action: 'INVESTOR_UPDATE',
      metadata: {
        investorId: investor.id,
        name: investor.name,
        actorName: auth.getUserOrFail().name,
      },
    })

    return serialize({
      investor: InvestorTransformer.transform(investor),
    })
  }
}
