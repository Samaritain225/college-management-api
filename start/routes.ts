import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AccessTokensController = () => import('#controllers/access_tokens_controller')
const UsersController = () => import('#controllers/users_controller')
const InvestorsController = () => import('#controllers/investors_controller')
const RolesController = () => import('#controllers/roles_controller')
const BudgetCategoriesController = () => import('#controllers/budget_categories_controller')
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

    // Budget category routes
    router
      .group(() => {
        router.get('/', [BudgetCategoriesController, 'index'])
        router.get('/:id', [BudgetCategoriesController, 'show'])
        router.post('/', [BudgetCategoriesController, 'store'])
        router.patch('/:id', [BudgetCategoriesController, 'update'])
        router.delete('/:id', [BudgetCategoriesController, 'destroy'])
      })
      .prefix('categories')
      .use(middleware.auth())

    // Expense routes
    router
      .group(() => {
        router.get('/', [ExpensesController, 'index'])
        router.get('/:id', [ExpensesController, 'show'])
        router.post('/', [ExpensesController, 'store'])
        router.patch('/:id', [ExpensesController, 'update'])
        router.delete('/:id', [ExpensesController, 'destroy'])
      })
      .prefix('expenses')
      .use(middleware.auth())

    // User activities log routes
    router.get('/activities', [ActivitiesController, 'index']).use(middleware.auth())

    // Roles list (for frontend dropdowns)
    router.get('/roles', [RolesController, 'index']).use(middleware.auth())
  })
  .prefix('/api/v1')
