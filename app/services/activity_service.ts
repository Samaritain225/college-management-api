import emitter from '@adonisjs/core/services/emitter'

export interface ActivityPayload {
  userId: string | null
  action: string
  description?: string | null
  metadata?: any
}

declare module '@adonisjs/core/types' {
  interface EventsList {
    'activity:log': ActivityPayload
  }
}

export class ActivityService {
  log(payload: ActivityPayload) {
    emitter.emit('activity:log', payload)
  }
}

const activityService = new ActivityService()
export default activityService
