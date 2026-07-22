import vine from '@vinejs/vine'
import { TABLES } from '#constants/tables'

export const createExpenseValidator = vine.compile(
  vine.object({
    amount: vine.number().min(0),
    categoryId: vine.string().exists(async (db: any, value: string) => {
      const match = await db.from(TABLES.EXPENSE_CATEGORIES).where('id', value).first()
      return !!match
    }),
    description: vine.string().maxLength(500),
    spentAt: vine.string(),
    receiptPhotoPath: vine.string().nullable().optional(),
    reversesExpenseId: vine
      .string()
      .exists(async (db: any, value: string) => {
        const match = await db.from(TABLES.EXPENSES).where('id', value).first()
        return !!match
      })
      .nullable()
      .optional(),
  })
)

export const updateExpenseValidator = vine.compile(
  vine.object({
    amount: vine.number().min(0).optional(),
    categoryId: vine
      .string()
      .exists(async (db: any, value: string) => {
        const match = await db.from(TABLES.EXPENSE_CATEGORIES).where('id', value).first()
        return !!match
      })
      .optional(),
    description: vine.string().maxLength(500).optional(),
    spentAt: vine.string().optional(),
    receiptPhotoPath: vine.string().nullable().optional(),
  })
)
