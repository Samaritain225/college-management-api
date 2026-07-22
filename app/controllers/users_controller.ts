import Investor from '#models/investor'
import User from '#models/user'
import activityService from '#services/activity_service'
import UserTransformer from '#transformers/user_transformer'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { manageUsers, manageAdmins } from '#abilities/main'

export default class UsersController {
  /**
   * GET /users
   */
  async index({ bouncer, response, serialize }: HttpContext) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden({ message: 'Unauthorized access to user management' })
    }

    const users = await User.query().orderBy('name', 'asc')
    return serialize({
      users: UserTransformer.transform(users),
    })
  }

  /**
   * POST /users
   */
  async store({ request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies(manageUsers)) {
      return response.forbidden({ message: 'Unauthorized to create users' })
    }

    const currentUser = auth.getUserOrFail()
    const payload = await request.validateUsing(createUserValidator)

    // Check role restrictions: only super_admin can create admin/super_admin roles
    if (payload.roleId !== 'investor') {
      if (await bouncer.denies(manageAdmins)) {
        return response.forbidden({
          message: 'Only super admins can create admin or super admin accounts',
        })
      }
    }

    const user = await User.create({
      id: randomUUID(),
      name: payload.name,
      email: payload.email,
      password: payload.password,
      roleId: payload.roleId,
      isActive: true,
      createdBy: currentUser.id,
    })

    activityService.log({
      userId: currentUser.id,
      action: 'USER_CREATE',
      description: `User created: ${user.name} (${user.email})`,
      metadata: { targetUserId: user.id, role: user.roleId },
    })

    return serialize({
      user: UserTransformer.transform(user),
    })
  }

  /**
   * PATCH /users/:id
   */
  async update({ params, request, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized to update users' })
    }

    const user = await User.findOrFail(params.id)
    const payload = await request.validateUsing(updateUserValidator, {
      meta: { userId: user.id },
    })

    // If target is super_admin, prevent role changes
    if (user.roleId === 'super_admin') {
      if (payload.roleId && payload.roleId !== 'super_admin') {
        return response.badRequest({ message: 'A super admin role can never be changed' })
      }
    }

    // Check if promoting/demoting to/from admin or super_admin
    const isTargetAdminOrSuper = user.roleId === 'admin' || user.roleId === 'super_admin'
    const isNewRoleAdminOrSuper =
      payload.roleId && (payload.roleId === 'admin' || payload.roleId === 'super_admin')

    if (isTargetAdminOrSuper || isNewRoleAdminOrSuper) {
      if (await bouncer.denies(manageAdmins)) {
        return response.forbidden({
          message: 'Only super admins can modify admin or super admin accounts',
        })
      }
    }

    const oldName = user.name

    user.merge({
      name: payload.name ?? user.name,
      email: payload.email ?? user.email,
      phone: payload.phone !== undefined ? payload.phone : user.phone,
    })

    if (payload.password) {
      user.password = payload.password
    }

    if (payload.roleId) {
      user.roleId = payload.roleId
    }

    await user.save()

    // Application-level name sync: if user name changed, update linked investor records
    if (payload.name && payload.name !== oldName) {
      await Investor.query().where('userId', user.id).update({ name: payload.name })
    }

    activityService.log({
      userId: auth.getUserOrFail().id,
      action: 'USER_UPDATE',
      description: `User updated: ${user.name} (${user.email})`,
      metadata: { targetUserId: user.id },
    })

    return serialize({
      user: UserTransformer.transform(user),
    })
  }

  /**
   * PATCH /users/:id/deactivate
   */
  async deactivate({ params, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized' })
    }

    const user = await User.findOrFail(params.id)

    // Hard Guard: super_admin can never be deactivated
    if (user.roleId === 'super_admin') {
      return response.badRequest({ message: 'A super admin can never be deactivated' })
    }

    // Manage admins check
    if (user.roleId === 'admin') {
      if (await bouncer.denies(manageAdmins)) {
        return response.forbidden({ message: 'Only super admins can deactivate admins' })
      }
    }

    user.isActive = false
    await user.save()

    activityService.log({
      userId: auth.getUserOrFail().id,
      action: 'USER_DEACTIVATE',
      description: `User deactivated: ${user.name} (${user.email})`,
      metadata: { targetUserId: user.id },
    })

    return serialize({
      user: UserTransformer.transform(user),
    })
  }

  /**
   * PATCH /users/:id/reactivate
   */
  async reactivate({ params, response, auth, bouncer, serialize }: HttpContext) {
    if (await bouncer.denies('manageUsers')) {
      return response.forbidden({ message: 'Unauthorized' })
    }

    const user = await User.findOrFail(params.id)

    // Manage admins check
    if (user.roleId === 'admin' || user.roleId === 'super_admin') {
      if (await bouncer.denies(manageAdmins)) {
        return response.forbidden({ message: 'Only super admins can reactivate admin accounts' })
      }
    }

    user.isActive = true
    await user.save()

    activityService.log({
      userId: auth.getUserOrFail().id,
      action: 'USER_REACTIVATE',
      description: `User reactivated: ${user.name} (${user.email})`,
      metadata: { targetUserId: user.id },
    })

    return serialize({
      user: UserTransformer.transform(user),
    })
  }
}
