import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'investors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.string('phone').nullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table
        .enum('role', ['super_admin', 'admin', 'investor'], {
          useNative: true,
          enumName: 'investor_role',
        })
        .notNullable()
        .defaultTo('investor')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.integer('agreed_contribution').notNullable()
      table.timestamp('joined_at').notNullable()
      table.uuid('created_by').nullable().references('id').inTable('investors')
      table.timestamp('synced_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS investor_role')
  }
}
