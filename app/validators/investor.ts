import vine from '@vinejs/vine'

export const createInvestorValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255),
    agreedContribution: vine.number().min(0),
    joinedAt: vine.string().nullable().optional(),
    userId: vine
      .string()
      .uuid()
      .exists(async (db: any, value: string) => {
        const match = await db.from('users').where('id', value).first()
        return !!match
      })
      .nullable()
      .optional(),
  })
)

export const updateInvestorValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255).optional(),
    agreedContribution: vine.number().min(0).optional(),
    joinedAt: vine.string().nullable().optional(),
  })
)
