import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.string('phone').nullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.string('role_id').notNullable().references('id').inTable('roles')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.uuid('created_by').nullable().references('id').inTable('users')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}