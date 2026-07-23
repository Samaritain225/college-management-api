import Contribution from '#models/contribution'
import { createContributionValidator } from '#validators/contribution'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import ContributionTransformer from '#transformers/contribution_transformer'
import activityService from '#services/activity_service'
import { manageUsers } from '#abilities/main'

export default class ContributionsController {
  /**
   * GET /contributions
   */
  async index({ bouncer, response, serialize }: HttpContext) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden({ message: 'Unauthorized access to contribution management' })
    }

    const contributions = await Contribution.query()
      .preload('investor')
      .preload('recorder')
      .orderBy('paidAt', 'desc')

    return serialize({
      contributions: ContributionTransformer.transform(contributions),
    })
  }

  /**
   * POST /contributions
   */
  async store({ request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden({ message: 'Unauthorized to record contributions' })
    }

    const currentUser = auth.getUserOrFail()
    const payload = await request.validateUsing(createContributionValidator)

    const contribution = await Contribution.create({
      id: randomUUID(),
      investorId: payload.investorId,
      amount: payload.amount,
      paidAt: payload.paidAt ? DateTime.fromISO(payload.paidAt) : DateTime.now(),
      method: payload.method ?? null,
      note: payload.note ?? null,
      recordedBy: currentUser.id,
    })

    await contribution.load('investor')
    await contribution.load('recorder')

    activityService.log({
      userId: currentUser.id,
      action: 'CONTRIBUTION_CREATE',
      metadata: {
        contributionId: contribution.id,
        investorId: contribution.investorId,
        investorName: contribution.investor?.name,
        amount: contribution.amount,
        method: contribution.method,
        actorName: currentUser.name,
      },
    })

    return serialize({
      contribution: ContributionTransformer.transform(contribution),
    })
  }
}
