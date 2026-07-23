import UserActivity from '#models/user_activity'
import type { ActivityPayload } from '#services/activity_service'
import { randomUUID } from 'node:crypto'
import encryption from '@adonisjs/core/services/encryption'

export default class ActivityListener {
  async onActivityLog(payload: ActivityPayload) {
    try {
      // Encrypt metadata before persisting to protect any sensitive context
      // (e.g. email addresses in failed login attempts, internal resource IDs)
      const encryptedMetadata = payload.metadata
        ? encryption.encrypt(JSON.stringify(payload.metadata))
        : null

      await UserActivity.create({
        id: randomUUID(),
        userId: payload.userId,
        action: payload.action,
        description: payload.description ?? null,
        metadata: encryptedMetadata,
      })
    } catch (error) {
      console.error('Failed to save activity log to database:', error)
    }
  }
}
