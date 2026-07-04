import vine from '@vinejs/vine'
import { TABLES } from '#constants/tables'

/**
 * Role validation: roleId is validated via a live DB check against the
 * `roles` table. This avoids hardcoding role values as a TypeScript enum.
 * Adding a new role is a data insert + seeder update, zero code changes.
 *
 * If performance becomes a concern at scale, this can be upgraded to a
 * cached in-memory set refreshed at startup — but the DB query approach
 * is simpler and sufficient at current volume.
 */

export const createUserValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255),
    email: vine
      .string()
      .email()
      .maxLength(254)
      .unique(async (db: any, value: string) => {
        const match = await db.from(TABLES.USERS).where('email', value).first()
        return !match
      }),
    password: vine.string().minLength(8).maxLength(32),
    roleId: vine.string().exists(async (db: any, value: string) => {
      const match = await db.from(TABLES.ROLES).where('id', value).first()
      return !!match
    }),
    phone: vine.string().nullable().optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255).optional(),
    email: vine
      .string()
      .email()
      .maxLength(254)
      .unique(async (db: any, value: string, field: any) => {
        const userId = field.meta.userId
        if (!userId) return true
        const match = await db
          .from(TABLES.USERS)
          .where('email', value)
          .whereNot('id', userId)
          .first()
        return !match
      })
      .optional(),
    password: vine.string().minLength(8).maxLength(32).optional(),
    roleId: vine
      .string()
      .exists(async (db: any, value: string) => {
        const match = await db.from(TABLES.ROLES).where('id', value).first()
        return !!match
      })
      .optional(),
    phone: vine.string().nullable().optional(),
  })
)
