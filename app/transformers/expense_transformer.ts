import type Expense from '#models/expense'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ExpenseTransformer extends BaseTransformer<Expense> {
  toObject() {
    const base = this.pick(this.resource, [
      'id',
      'amount',
      'categoryId',
      'description',
      'receiptPhotoPath',
      'recordedBy',
      'reversesExpenseId',
      'spentAt',
      'syncedAt',
      'createdAt',
    ])

    // If preloaded category info, we can expose it
    const expense = this.resource as any
    if (expense.category) {
      return {
        ...base,
        category: {
          id: expense.category.id,
          name: expense.category.name,
          description: expense.category.description,
        },
      }
    }

    return base
  }
}
