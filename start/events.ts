import emitter from '@adonisjs/core/services/emitter'

const ActivityListener = () => import('#listeners/activity_listener')

emitter.on('activity:log', [ActivityListener, 'onActivityLog'])
