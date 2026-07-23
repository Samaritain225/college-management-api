import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_activities'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('description', 500).nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('description', 500).notNullable().alter()
    })
  }
}
