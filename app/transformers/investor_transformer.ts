import type Investor from '#models/investor'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class InvestorTransformer extends BaseTransformer<Investor> {
  toObject() {
    const base = this.pick(this.resource, [
      'id',
      'userId',
      'name',
      'agreedContribution',
      'joinedAt',
      'createdBy',
      'syncedAt',
      'createdAt',
      'updatedAt',
    ])

    // Include linked user's name/email for convenience when userId is set
    const investor = this.resource as any
    if (investor.$extras?.userName || investor.$extras?.userEmail) {
      return {
        ...base,
        user: {
          name: investor.$extras.userName ?? null,
          email: investor.$extras.userEmail ?? null,
        },
      }
    }

    return base
  }
}
