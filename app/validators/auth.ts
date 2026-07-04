import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().maxLength(254),
    password: vine.string(),
  })
)

export const refreshValidator = vine.compile(
  vine.object({
    refreshToken: vine.string(),
  })
)
