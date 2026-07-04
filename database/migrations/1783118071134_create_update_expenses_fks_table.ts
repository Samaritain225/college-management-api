import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'expenses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['recorded_by'])
      table.uuid('recorded_by').notNullable().references('id').inTable('users').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['recorded_by'])
      table.uuid('recorded_by').notNullable().references('id').inTable('investors').alter()
    })
  }
}
