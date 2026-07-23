import type Contribution from '#models/contribution'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ContributionTransformer extends BaseTransformer<Contribution> {
  toObject() {
    const base = this.pick(this.resource, [
      'id',
      'investorId',
      'amount',
      'paidAt',
      'method',
      'note',
      'recordedBy',
      'syncedAt',
      'createdAt',
    ])

    const contrib = this.resource as any
    return {
      ...base,
      ...(contrib.investor
        ? {
            investor: {
              id: contrib.investor.id,
              name: contrib.investor.name,
            },
          }
        : {}),
      ...(contrib.recorder
        ? {
            recorder: {
              id: contrib.recorder.id,
              name: contrib.recorder.name,
            },
          }
        : {}),
    }
  }
}
