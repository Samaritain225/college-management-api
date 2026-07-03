import vine from '@vinejs/vine'

export const createInvestorValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255),
    email: vine
      .string()
      .email()
      .maxLength(254)
      .unique(async (db: any, value: string) => {
        const match = await db.from('investors').where('email', value).first()
        return !match
      }),
    password: vine.string().minLength(8).maxLength(32),
    role: vine.enum(['super_admin', 'admin', 'investor'] as const),
    agreedContribution: vine.number().min(0),
    phone: vine.string().nullable().optional(),
    joinedAt: vine.string().nullable().optional(),
  })
)

export const updateInvestorValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255).optional(),
    email: vine
      .string()
      .email()
      .maxLength(254)
      .unique(async (db: any, value: string, field: any) => {
        const investorId = field.meta.investorId
        if (!investorId) return true
        const match = await db
          .from('investors')
          .where('email', value)
          .whereNot('id', investorId)
          .first()
        return !match
      })
      .optional(),

    password: vine.string().minLength(8).maxLength(32).optional(),
    role: vine.enum(['super_admin', 'admin', 'investor'] as const).optional(),
    agreedContribution: vine.number().min(0).optional(),
    phone: vine.string().nullable().optional(),
    joinedAt: vine.string().nullable().optional(),
  })
)
