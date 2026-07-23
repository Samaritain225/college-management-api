import type UserActivity from '#models/user_activity'
import { BaseTransformer } from '@adonisjs/core/transformers'
import encryption from '@adonisjs/core/services/encryption'

export default class ActivityTransformer extends BaseTransformer<UserActivity> {
  toObject() {
    const base = this.pick(this.resource, ['id', 'userId', 'action', 'description', 'createdAt'])

    const activity = this.resource as any
    let parsedMetadata = null
    if (activity.metadata) {
      try {
        // Decrypt the AES-256-GCM encrypted metadata, then parse as JSON
        const decrypted = encryption.decrypt<string>(activity.metadata)
        parsedMetadata = decrypted ? JSON.parse(decrypted) : null
      } catch {
        // Gracefully handle records that may have been written before encryption
        // was introduced, falling back to raw metadata
        parsedMetadata = activity.metadata
      }
    }

    const payload: any = {
      ...base,
      userName: activity.user?.name ?? parsedMetadata?.actorName ?? null,
      metadata: parsedMetadata,
    }

    if (activity.user) {
      payload.user = {
        id: activity.user.id,
        name: activity.user.name,
        email: activity.user.email,
      }
    }

    return payload
  }
}
