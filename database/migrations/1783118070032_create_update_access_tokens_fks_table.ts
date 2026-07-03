import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['tokenable_id'])
      table.uuid('tokenable_id').notNullable().references('id').inTable('users').onDelete('CASCADE').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['tokenable_id'])
      table.uuid('tokenable_id').notNullable().references('id').inTable('investors').onDelete('CASCADE').alter()
    })
  }
}