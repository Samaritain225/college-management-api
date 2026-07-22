import Role from '#models/role'
import type { HttpContext } from '@adonisjs/core/http'
import { manageUsers } from '#abilities/main'

export default class RolesController {
  /**
   * GET /roles
   */
  async index({ bouncer, response, serialize }: HttpContext) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden({ message: 'Unauthorized' })
    }

    const roles = await Role.query().orderBy('id', 'asc')
    return serialize({ roles })
  }
}
