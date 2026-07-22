import type ExpenseCategory from '#models/expense_category'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ExpenseCategoryTransformer extends BaseTransformer<ExpenseCategory> {
  toObject() {
    const base = this.pick(this.resource, [
      'id',
      'name',
      'description',
      'createdBy',
      'syncedAt',
      'createdAt',
    ])

    const category = this.resource as any
    if (category.creator) {
      return {
        ...base,
        creator: {
          id: category.creator.id,
          name: category.creator.name,
          email: category.creator.email,
        },
      }
    }

    return base
  }
}
