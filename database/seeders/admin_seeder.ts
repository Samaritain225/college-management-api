import { BaseSeeder } from '@adonisjs/lucid/seeders'
import env from '#start/env'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    const email = env.get('SEED_ADMIN_EMAIL') || 'admin@example.com'
    const password = env.get('SEED_ADMIN_PASSWORD') || 'AdminPassword123!'
    const name = env.get('SEED_ADMIN_NAME') || 'Administrateur'

    // Check if admin user already exists
    const existing = await db
      .from('users')
      .where('role_id', 'admin')
      .orWhere('email', email)
      .first()

    if (existing) {
      console.log('Admin user already exists, skipping seed.')
      return
    }

    const hashedPassword = await hash.make(password)

    await db.table('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      role_id: 'admin',
      is_active: true,
      created_at: DateTime.now().toSQL(),
      updated_at: DateTime.now().toSQL(),
    })

    console.log(`Admin user seeded successfully: ${email}`)
  }
}
