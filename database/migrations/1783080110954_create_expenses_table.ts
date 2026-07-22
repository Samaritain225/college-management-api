import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'expenses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('category_id').notNullable().references('id').inTable('expense_categories')
      table.integer('amount').notNullable()
      table.string('description').notNullable()
      table.string('receipt_photo_path').nullable()
      table.timestamp('spent_at').notNullable()
      table.uuid('recorded_by').notNullable().references('id').inTable('investors')
      table.uuid('reverses_expense_id').nullable().references('id').inTable('expenses')
      table.timestamp('synced_at').nullable()
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
