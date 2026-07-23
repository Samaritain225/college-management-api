import { ExpenseSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ExpenseCategory from '#models/expense_category'
import User from '#models/user'

export default class Expense extends ExpenseSchema {
  @belongsTo(() => ExpenseCategory, {
    foreignKey: 'categoryId',
  })
  declare category: BelongsTo<typeof ExpenseCategory>

  @belongsTo(() => User, {
    foreignKey: 'recordedBy',
  })
  declare recorder: BelongsTo<typeof User>
}
