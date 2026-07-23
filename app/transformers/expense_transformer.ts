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

    const expense = this.resource as any
    return {
      ...base,
      ...(expense.category
        ? {
            category: {
              id: expense.category.id,
              name: expense.category.name,
              description: expense.category.description,
            },
          }
        : {}),
      ...(expense.recorder
        ? {
            recorder: {
              id: expense.recorder.id,
              name: expense.recorder.name,
            },
          }
        : {}),
    }
  }
}
