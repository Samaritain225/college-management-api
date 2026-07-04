import type BudgetCategory from '#models/budget_category'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class BudgetCategoryTransformer extends BaseTransformer<BudgetCategory> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'syncedAt', 'createdAt'])
  }
}
