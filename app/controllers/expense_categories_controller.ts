import ExpenseCategory from '#models/expense_category'
import { createExpenseCategoryValidator } from '#validators/expense_category'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import ExpenseCategoryTransformer from '#transformers/expense_category_transformer'
import activityService from '#services/activity_service'
import { manageUsers } from '#abilities/main'

export default class ExpenseCategoriesController {
  /**
   * GET /expense-categories
   */
  async index({ serialize }: HttpContext) {
    const categories = await ExpenseCategory.query().orderBy('name', 'asc')
    return serialize({
      categories: ExpenseCategoryTransformer.transform(categories),
    })
  }

  /**
   * GET /expense-categories/:id
   */
  async show({ params, serialize }: HttpContext) {
    const category = await ExpenseCategory.findOrFail(params.id)
    return serialize({
      category: ExpenseCategoryTransformer.transform(category),
    })
  }

  /**
   * POST /expense-categories
   */
  async store({ request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden({ message: 'Unauthorized to create expense categories' })
    }

    const currentUser = auth.getUserOrFail()
    const payload = await request.validateUsing(createExpenseCategoryValidator)

    const category = await ExpenseCategory.create({
      id: randomUUID(),
      name: payload.name,
      description: payload.description,
      createdBy: currentUser.id,
    })

    activityService.log({
      userId: currentUser.id,
      action: 'EXPENSE_CATEGORY_CREATE',
      description: `Expense category created: ${category.name}`,
      metadata: { categoryId: category.id },
    })

    return serialize({
      category: ExpenseCategoryTransformer.transform(category),
    })
  }
}
