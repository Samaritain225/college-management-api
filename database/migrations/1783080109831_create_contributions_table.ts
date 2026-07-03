import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contributions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('investor_id').notNullable().references('id').inTable('investors')
      table.integer('amount').notNullable()
      table.timestamp('paid_at').notNullable()
      table.string('method').nullable()
      table.string('note').nullable()
      table.uuid('recorded_by').notNullable().references('id').inTable('investors')
      table.timestamp('synced_at').nullable()
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
