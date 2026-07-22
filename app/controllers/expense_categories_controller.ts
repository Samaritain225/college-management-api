import ExpenseCategory from '#models/expense_category'
import Expense from '#models/expense'
import {
  createExpenseCategoryValidator,
  updateExpenseCategoryValidator,
} from '#validators/expense_category'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import ExpenseCategoryTransformer from '#transformers/expense_category_transformer'
import activityService from '#services/activity_service'

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
    if (await bouncer.denies('manageUsers')) {
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

  /**
   * PATCH /expense-categories/:id
   */
  async update({ params, request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized to update expense categories' })
    }

    const currentUser = auth.getUserOrFail()
    const category = await ExpenseCategory.findOrFail(params.id)

    // Provide categoryId metadata for unique validation logic excluding current record
    const payload = await request.validateUsing(updateExpenseCategoryValidator, {
      meta: { categoryId: category.id },
    })

    category.merge({
      name: payload.name ?? category.name,
      description: payload.description !== undefined ? payload.description : category.description,
    })

    await category.save()

    activityService.log({
      userId: currentUser.id,
      action: 'EXPENSE_CATEGORY_UPDATE',
      description: `Expense category updated: ${category.name}`,
      metadata: { categoryId: category.id },
    })

    return serialize({
      category: ExpenseCategoryTransformer.transform(category),
    })
  }

  /**
   * DELETE /expense-categories/:id
   */
  async destroy({ params, response, auth, bouncer }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized to delete expense categories' })
    }

    const currentUser = auth.getUserOrFail()
    const category = await ExpenseCategory.findOrFail(params.id)

    // Check if any expenses are linked to this category
    const linkedExpense = await Expense.query().where('categoryId', category.id).first()
    if (linkedExpense) {
      return response.badRequest({ message: 'Cannot delete category with associated expenses' })
    }

    await category.delete()

    activityService.log({
      userId: currentUser.id,
      action: 'EXPENSE_CATEGORY_DELETE',
      description: `Expense category deleted: ${category.name}`,
      metadata: { categoryId: category.id },
    })

    return response.noContent()
  }
}
