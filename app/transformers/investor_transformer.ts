import type Investor from '#models/investor'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class InvestorTransformer extends BaseTransformer<Investor> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'email',
      'phone',
      'role',
      'isActive',
      'agreedContribution',
      'joinedAt',
      'createdBy',
      'syncedAt',
      'createdAt',
      'updatedAt',
    ])
  }
}
