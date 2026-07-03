import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
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

    for (const role of roles) {
      const existing = await db.from('roles').where('id', role.id).first()
      if (!existing) {
        await db.table('roles').insert({
          ...role,
          created_at: DateTime.now().toSQL(),
        })
      }
    }
  }
}