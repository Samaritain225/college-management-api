import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AccessTokensController = () => import('#controllers/access_tokens_controller')
const UsersController = () => import('#controllers/users_controller')
const InvestorsController = () => import('#controllers/investors_controller')
const RolesController = () => import('#controllers/roles_controller')
const ExpenseCategoriesController = () => import('#controllers/expense_categories_controller')
const ExpensesController = () => import('#controllers/expenses_controller')

const ActivitiesController = () => import('#controllers/activities_controller')

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
      .resource('users', UsersController)
      .only(['index', 'store', 'update'])
      .use('*', middleware.auth())
    router.patch('users/:id/deactivate', [UsersController, 'deactivate']).use(middleware.auth())
    router.patch('users/:id/reactivate', [UsersController, 'reactivate']).use(middleware.auth())

    // Investor management routes (financial stake)
    router
      .resource('investors', InvestorsController)
      .only(['index', 'store', 'update'])
      .use('*', middleware.auth())

    // Expense category routes
    router
      .resource('expense-categories', ExpenseCategoriesController)
      .apiOnly()
      .use('*', middleware.auth())

    // Expense routes
    router.resource('expenses', ExpensesController).apiOnly().use('*', middleware.auth())

    // User activities log routes
    router.get('/activities', [ActivitiesController, 'index']).use(middleware.auth())

    // Roles list (for frontend dropdowns)
    router.get('/roles', [RolesController, 'index']).use(middleware.auth())
  })
  .prefix('/api/v1')
