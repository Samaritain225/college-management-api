import { BaseSeeder } from '@adonisjs/lucid/seeders'
import env from '#start/env'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    const email = env.get('SEED_SUPER_ADMIN_EMAIL')
    const password = env.get('SEED_SUPER_ADMIN_PASSWORD')
    const name = env.get('SEED_SUPER_ADMIN_NAME')

    if (!email || !password || !name) {
      console.log(
        'Skipping super admin seeding: SEED_SUPER_ADMIN_EMAIL, SEED_SUPER_ADMIN_PASSWORD, or SEED_SUPER_ADMIN_NAME is not set.'
      )
      return
    }

    // Check if super_admin already exists in users table
    const existing = await db
      .from('users')
      .where('role_id', 'super_admin')
      .orWhere('email', email)
      .first()

    if (existing) {
      console.log('Super admin already exists, skipping seed.')
      return
    }

    const hashedPassword = await hash.make(password)

    await db.table('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      role_id: 'super_admin',
      is_active: true,
      created_at: DateTime.now().toSQL(),
      updated_at: DateTime.now().toSQL(),
    })

    console.log(`Super admin user seeded successfully: ${email}`)
  }
}
