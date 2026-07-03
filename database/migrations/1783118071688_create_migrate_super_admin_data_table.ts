import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // ---------------------------------------------------------------
    // This migration runs AFTER the FK repoints on:
    //   - auth_access_tokens.tokenable_id  → users(id)
    //   - contributions.recorded_by        → users(id)
    //   - expenses.recorded_by             → users(id)
    //
    // At this point nothing in contributions/expenses/access_tokens
    // references investors(id) any more, so it is safe to delete
    // investor rows or update their user_id links.
    // ---------------------------------------------------------------

    const investors = await this.db.from('investors').select('*')

    for (const row of investors) {
      // Look up the corresponding user row (same UUID, created in alter_investors_table)
      const user = await this.db.from('users').where('id', row.id).first()
      if (!user) continue

      if (user.role_id === 'super_admin') {
        // The super_admin has no financial stake — remove the investor record entirely.
        await this.db.from('investors').where('id', row.id).delete()
      } else {
        // Link the investor record to the corresponding user
        await this.db.from('investors').where('id', row.id).update({ user_id: row.id })
      }
    }
  }

  async down() {
    // Reverse: unlink user_id on all investor rows (cannot restore deleted super_admin row)
    await this.db.from('investors').update({ user_id: null })
  }
}