import BudgetCategory from '#models/budget_category'
import Expense from '#models/expense'
import {
  createBudgetCategoryValidator,
  updateBudgetCategoryValidator,
} from '#validators/budget_category'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import BudgetCategoryTransformer from '#transformers/budget_category_transformer'
import activityService from '#services/activity_service'

export default class BudgetCategoriesController {
  /**
   * GET /categories
   */
  async index({ serialize }: HttpContext) {
    const categories = await BudgetCategory.query().orderBy('name', 'asc')
    return serialize({
      categories: BudgetCategoryTransformer.transform(categories),
    })
  }

  /**
   * GET /categories/:id
   */
  async show({ params, serialize }: HttpContext) {
    const category = await BudgetCategory.findOrFail(params.id)
    return serialize({
      category: BudgetCategoryTransformer.transform(category),
    })
  }

  /**
   * POST /categories
   */
  async store({ request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized to create budget categories' })
    }

    const payload = await request.validateUsing(createBudgetCategoryValidator)

    const category = await BudgetCategory.create({
      id: randomUUID(),
      name: payload.name,
    })

    activityService.log({
      userId: auth.getUserOrFail().id,
      action: 'CATEGORY_CREATE',
      description: `Budget category created: ${category.name}`,
      metadata: { categoryId: category.id },
    })

    return serialize({
      category: BudgetCategoryTransformer.transform(category),
    })
  }

  /**
   * PATCH /categories/:id
   */
  async update({ params, request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized to update budget categories' })
    }

    const category = await BudgetCategory.findOrFail(params.id)

    // Provide categoryId metadata for unique validation logic excluding current record
    const payload = await request.validateUsing(updateBudgetCategoryValidator, {
      meta: { categoryId: category.id },
    })

    category.merge({
      name: payload.name ?? category.name,
    })

    await category.save()

    activityService.log({
      userId: auth.getUserOrFail().id,
      action: 'CATEGORY_UPDATE',
      description: `Budget category updated: ${category.name}`,
      metadata: { categoryId: category.id },
    })

    return serialize({
      category: BudgetCategoryTransformer.transform(category),
    })
  }

  /**
   * DELETE /categories/:id
   */
  async destroy({ params, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized to delete budget categories' })
    }

    const category = await BudgetCategory.findOrFail(params.id)

    // Check if any expenses are linked to this category
    const linkedExpense = await Expense.query().where('categoryId', category.id).first()
    if (linkedExpense) {
      return response.badRequest({ message: 'Cannot delete category with associated expenses' })
    }

    await category.delete()

    activityService.log({
      userId: auth.getUserOrFail().id,
      action: 'CATEGORY_DELETE',
      description: `Budget category deleted: ${category.name}`,
      metadata: { categoryId: category.id },
    })

    return response.noContent()
  }
}
