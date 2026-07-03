import Investor from '#models/investor'
import { createInvestorValidator, updateInvestorValidator } from '#validators/investor'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import InvestorTransformer from '#transformers/investor_transformer'

export default class UsersController {
  /**
   * GET /users
   */
  async index({ bouncer, response, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized access to user management' })
    }

    const investors = await Investor.query().orderBy('name', 'asc')
    return serialize({
      users: InvestorTransformer.transform(investors),
    })
  }

  /**
   * POST /users
   */
  async store({ request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized to create users' })
    }

    const currentUser = auth.getUserOrFail()
    const payload = await request.validateUsing(createInvestorValidator)

    // Check role restrictions: only super_admin can create admin/super_admin roles
    if (payload.role !== 'investor') {
      if (await bouncer.denies('manageAdmins')) {
        return response.forbidden({
          message: 'Only super admins can create admin or super admin accounts',
        })
      }
    }

    const investor = await Investor.create({
      id: randomUUID(),
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      isActive: true,
      agreedContribution: payload.agreedContribution,
      joinedAt: payload.joinedAt ? DateTime.fromISO(payload.joinedAt) : DateTime.now(),
      createdBy: currentUser.id,
    })

    return serialize({
      user: InvestorTransformer.transform(investor),
    })
  }

  /**
   * PATCH /users/:id
   */
  async update({ params, request, response, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized to update users' })
    }

    const investor = await Investor.findOrFail(params.id)
    const payload = await request.validateUsing(updateInvestorValidator, {
      meta: { investorId: investor.id },
    })

    // If target is super_admin, prevent role changes
    if (investor.role === 'super_admin') {
      if (payload.role && payload.role !== 'super_admin') {
        return response.badRequest({ message: 'A super admin role can never be changed' })
      }
    }

    // Check if promoting/demoting to/from admin or super_admin
    const isTargetAdminOrSuper = investor.role === 'admin' || investor.role === 'super_admin'
    const isNewRoleAdminOrSuper =
      payload.role && (payload.role === 'admin' || payload.role === 'super_admin')

    if (isTargetAdminOrSuper || isNewRoleAdminOrSuper) {
      if (await bouncer.denies('manageAdmins')) {
        return response.forbidden({
          message: 'Only super admins can modify admin or super admin accounts',
        })
      }
    }

    investor.merge({
      name: payload.name ?? investor.name,
      email: payload.email ?? investor.email,
      phone: payload.phone !== undefined ? payload.phone : investor.phone,
      agreedContribution: payload.agreedContribution ?? investor.agreedContribution,
      joinedAt: payload.joinedAt ? DateTime.fromISO(payload.joinedAt) : investor.joinedAt,
    })

    if (payload.password) {
      investor.password = payload.password
    }

    if (payload.role) {
      investor.role = payload.role
    }

    await investor.save()

    return serialize({
      user: InvestorTransformer.transform(investor),
    })
  }

  /**
   * PATCH /users/:id/deactivate
   */
  async deactivate({ params, response, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized' })
    }

    const investor = await Investor.findOrFail(params.id)

    // Hard Guard: super_admin can never be deactivated
    if (investor.role === 'super_admin') {
      return response.badRequest({ message: 'A super admin can never be deactivated' })
    }

    // Manage admins check
    if (investor.role === 'admin') {
      if (await bouncer.denies('manageAdmins')) {
        return response.forbidden({ message: 'Only super admins can deactivate admins' })
      }
    }

    investor.isActive = false
    await investor.save()

    return serialize({
      user: InvestorTransformer.transform(investor),
    })
  }

  /**
   * PATCH /users/:id/reactivate
   */
  async reactivate({ params, response, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized' })
    }

    const investor = await Investor.findOrFail(params.id)

    // Manage admins check
    if (investor.role === 'admin' || investor.role === 'super_admin') {
      if (await bouncer.denies('manageAdmins')) {
        return response.forbidden({ message: 'Only super admins can reactivate admin accounts' })
      }
    }

    investor.isActive = true
    await investor.save()

    return serialize({
      user: InvestorTransformer.transform(investor),
    })
  }
}
