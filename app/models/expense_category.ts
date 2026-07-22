import { ExpenseCategorySchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Expense from '#models/expense'
import User from '#models/user'

export default class ExpenseCategory extends ExpenseCategorySchema {
  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => Expense, {
    foreignKey: 'categoryId',
  })
  declare expenses: HasMany<typeof Expense>
}
