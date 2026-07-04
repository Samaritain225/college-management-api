import Expense from '#models/expense'
import { createExpenseValidator, updateExpenseValidator } from '#validators/expense'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import ExpenseTransformer from '#transformers/expense_transformer'
import activityService from '#services/activity_service'

export default class ExpensesController {
  /**
   * GET /expenses
   */
  async index({ serialize }: HttpContext) {
    const expenses = await Expense.query().preload('category').orderBy('spentAt', 'desc')
    return serialize({
      expenses: ExpenseTransformer.transform(expenses),
    })
  }

  /**
   * GET /expenses/:id
   */
  async show({ params, serialize }: HttpContext) {
    const expense = await Expense.findOrFail(params.id)
    await expense.load('category')
    return serialize({
      expense: ExpenseTransformer.transform(expense),
    })
  }

  /**
   * POST /expenses
   */
  async store({ request, auth, serialize }: HttpContext) {
    const currentUser = auth.getUserOrFail()
    const payload = await request.validateUsing(createExpenseValidator)

    const expense = await Expense.create({
      id: randomUUID(),
      amount: payload.amount,
      categoryId: payload.categoryId,
      description: payload.description,
      spentAt: DateTime.fromISO(payload.spentAt),
      receiptPhotoPath: payload.receiptPhotoPath ?? null,
      reversesExpenseId: payload.reversesExpenseId ?? null,
      recordedBy: currentUser.id,
    })

    await expense.load('category')

    activityService.log({
      userId: currentUser.id,
      action: 'EXPENSE_CREATE',
      description: `Expense recorded: ${expense.description} — ${expense.amount}`,
      metadata: { expenseId: expense.id, categoryId: expense.categoryId, amount: expense.amount },
    })

    return serialize({
      expense: ExpenseTransformer.transform(expense),
    })
  }

  /**
   * PATCH /expenses/:id
   */
  async update({ params, request, auth, serialize }: HttpContext) {
    const currentUser = auth.getUserOrFail()
    const expense = await Expense.findOrFail(params.id)
    const payload = await request.validateUsing(updateExpenseValidator)

    expense.merge({
      amount: payload.amount ?? expense.amount,
      categoryId: payload.categoryId ?? expense.categoryId,
      description: payload.description ?? expense.description,
      spentAt: payload.spentAt ? DateTime.fromISO(payload.spentAt) : expense.spentAt,
      receiptPhotoPath:
        payload.receiptPhotoPath !== undefined
          ? payload.receiptPhotoPath
          : expense.receiptPhotoPath,
    })

    await expense.save()
    await expense.load('category')

    activityService.log({
      userId: currentUser.id,
      action: 'EXPENSE_UPDATE',
      description: `Expense updated: ${expense.description} — ${expense.amount}`,
      metadata: { expenseId: expense.id, categoryId: expense.categoryId },
    })

    return serialize({
      expense: ExpenseTransformer.transform(expense),
    })
  }

  /**
   * DELETE /expenses/:id
   */
  async destroy({ params, response, auth }: HttpContext) {
    const currentUser = auth.getUserOrFail()
    const expense = await Expense.findOrFail(params.id)

    activityService.log({
      userId: currentUser.id,
      action: 'EXPENSE_DELETE',
      description: `Expense deleted: ${expense.description} — ${expense.amount}`,
      metadata: { expenseId: expense.id },
    })

    await expense.delete()
    return response.noContent()
  }
}
