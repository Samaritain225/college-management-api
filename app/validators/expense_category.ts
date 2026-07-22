import vine from '@vinejs/vine'
import { TABLES } from '#constants/tables'

export const createExpenseCategoryValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .maxLength(255)
      .unique(async (db: any, value: string) => {
        const match = await db.from(TABLES.EXPENSE_CATEGORIES).where('name', value).first()
        return !match
      }),
    description: vine.string().maxLength(255).optional(),
  })
)

export const updateExpenseCategoryValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .maxLength(255)
      .unique(async (db: any, value: string, field: any) => {
        const categoryId = field.meta.categoryId
        if (!categoryId) return true
        const match = await db
          .from(TABLES.EXPENSE_CATEGORIES)
          .where('name', value)
          .whereNot('id', categoryId)
          .first()
        return !match
      })
      .optional(),
    description: vine.string().maxLength(255).optional(),
  })
)
