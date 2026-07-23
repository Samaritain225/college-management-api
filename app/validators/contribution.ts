import vine from '@vinejs/vine'
import { TABLES } from '#constants/tables'

export const createContributionValidator = vine.compile(
  vine.object({
    investorId: vine.string().exists(async (db: any, value: string) => {
      const match = await db.from(TABLES.INVESTORS).where('id', value).first()
      return !!match
    }),
    amount: vine.number().min(1),
    paidAt: vine.string().nullable().optional(),
    method: vine.string().maxLength(100).nullable().optional(),
    note: vine.string().maxLength(500).nullable().optional(),
  })
)
