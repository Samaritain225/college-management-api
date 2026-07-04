import { ExpenseSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import BudgetCategory from '#models/budget_category'

export default class Expense extends ExpenseSchema {
  @belongsTo(() => BudgetCategory, {
    foreignKey: 'categoryId',
  })
  declare category: BelongsTo<typeof BudgetCategory>
}
