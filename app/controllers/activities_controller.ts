import UserActivity from '#models/user_activity'
import type { HttpContext } from '@adonisjs/core/http'
import ActivityTransformer from '#transformers/activity_transformer'
import { manageUsers } from '#abilities/main'

export default class ActivitiesController {
  /**
   * GET /activities
   */
  async index({ bouncer, response, serialize }: HttpContext) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden({ message: 'Unauthorized access to user activity log' })
    }

    const activities = await UserActivity.query().preload('user').orderBy('createdAt', 'desc')
    return serialize({
      activities: ActivityTransformer.transform(activities),
    })
  }
}
