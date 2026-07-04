import { BudgetCategorySchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Expense from '#models/expense'

export default class BudgetCategory extends BudgetCategorySchema {
  @hasMany(() => Expense, {
    foreignKey: 'categoryId',
  })
  declare expenses: HasMany<typeof Expense>
}
