import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'investors'

  async up() {
    // ---------------------------------------------------------------
    // Phase 1 — Seed roles (must exist before inserting users with role_id FK)
    // ---------------------------------------------------------------
    const roles = [
      { id: 'super_admin', label: 'Super administrateur', description: 'Accès total' },
      { id: 'admin', label: 'Administrateur', description: 'Gestion administrative' },
      { id: 'principal', label: 'Proviseur / Directeur', description: 'Direction académique' },
      { id: 'censeur', label: 'Censeur', description: 'Responsable pédagogique' },
      { id: 'surveillant_general', label: 'Surveillant général', description: 'Discipline et assiduité' },
      { id: 'enseignant', label: 'Enseignant', description: 'Personnel enseignant' },
      { id: 'comptable', label: 'Comptable', description: 'Gestion de la trésorerie et comptes' },
      { id: 'secretaire', label: 'Secrétaire', description: 'Secrétariat et accueil' },
      { id: 'econome', label: 'Économe', description: 'Gestion du matériel' },
      { id: 'investor', label: 'Investisseur', description: 'Partenaire financier' },
    ]
    for (const r of roles) {
      const exists = await this.db.from('roles').where('id', r.id).first()
      if (!exists) {
        await this.db.table('roles').insert({
          id: r.id,
          label: r.label,
          description: r.description,
          created_at: new Date(),
        })
      }
    }

    // ---------------------------------------------------------------
    // Phase 2 — Copy every existing investor row into the new users table
    //           (same UUID so auth_access_tokens.tokenable_id stays valid)
    // ---------------------------------------------------------------
    const rows = await this.db.from(this.tableName).select('*')

    for (const row of rows) {
      let roleId = 'investor'
      if (row.role === 'super_admin' || row.role === 'admin') {
        roleId = row.role
      }

      await this.db.table('users').insert({
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        password: row.password,
        role_id: roleId,
        is_active: row.is_active,
        created_by: null,
        created_at: row.created_at || new Date(),
        updated_at: row.updated_at,
      })
    }

    // ---------------------------------------------------------------
    // Phase 3 — Schema-only changes on investors
    //
    // NOTE: We do NOT delete or relink investor rows here. The FK
    // repoints on contributions/expenses/access_tokens haven't run yet,
    // so deleting an investor row could violate those FKs. The
    // migrate_super_admin_data migration handles that after FK repoints.
    // ---------------------------------------------------------------
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('user_id').nullable().references('id').inTable('users')

      table.dropColumn('email')
      table.dropColumn('password')
      table.dropColumn('role')
      table.dropColumn('is_active')

      table.dropForeign(['created_by'])
      table.uuid('created_by').nullable().references('id').inTable('users').alter()
    })

    // Drop the native PG enum type left behind by the original migration
    this.schema.raw('DROP TYPE IF EXISTS investor_role')
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['created_by'])
      table.uuid('created_by').nullable().references('id').inTable('investors').alter()
      table.dropColumn('user_id')
      table.string('email').nullable()
      table.string('password').nullable()
      table.enum('role', ['super_admin', 'admin', 'investor']).nullable()
      table.boolean('is_active').defaultTo(true)
    })
  }
}