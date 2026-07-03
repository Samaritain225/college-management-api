import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AccessTokensController = () => import('#controllers/access_tokens_controller')
const UsersController = () => import('#controllers/users_controller')
const InvestorsController = () => import('#controllers/investors_controller')
const RolesController = () => import('#controllers/roles_controller')

router.get('/health', () => {
  return { status: 'ok' }
})

router
  .group(() => {
    // Auth routes
    router
      .group(() => {
        router.post('login', [AccessTokensController, 'store'])
        router.post('refresh', [AccessTokensController, 'refresh'])
        router.post('logout', [AccessTokensController, 'destroy']).use(middleware.auth())
        router.get('me', [AccessTokensController, 'show']).use(middleware.auth())
      })
      .prefix('auth')

    // User management routes
    router
      .group(() => {
        router.get('/', [UsersController, 'index'])
        router.post('/', [UsersController, 'store'])
        router.patch('/:id', [UsersController, 'update'])
        router.patch('/:id/deactivate', [UsersController, 'deactivate'])
        router.patch('/:id/reactivate', [UsersController, 'reactivate'])
      })
      .prefix('users')
      .use(middleware.auth())

    // Investor management routes (financial stake)
    router
      .group(() => {
        router.get('/', [InvestorsController, 'index'])
        router.post('/', [InvestorsController, 'store'])
        router.patch('/:id', [InvestorsController, 'update'])
      })
      .prefix('investors')
      .use(middleware.auth())

    // Roles list (for frontend dropdowns)
    router.get('/roles', [RolesController, 'index']).use(middleware.auth())
  })
  .prefix('/api/v1')
