import { ContributionSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Investor from '#models/investor'
import User from '#models/user'

export default class Contribution extends ContributionSchema {
  @belongsTo(() => Investor, {
    foreignKey: 'investorId',
  })
  declare investor: BelongsTo<typeof Investor>

  @belongsTo(() => User, {
    foreignKey: 'recordedBy',
  })
  declare recorder: BelongsTo<typeof User>
}
