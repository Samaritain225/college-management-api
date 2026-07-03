import { Bouncer } from '@adonisjs/bouncer'
import type User from '#models/user'

/**
 * Check if the user can manage general users.
 * Allowed: 'admin' and 'super_admin'
 */
export const manageUsers = Bouncer.ability((user: User) => {
  return user.roleId === 'admin' || user.roleId === 'super_admin'
})

/**
 * Check if the user can manage admin/super_admin accounts.
 * Allowed: 'super_admin' only
 */
export const manageAdmins = Bouncer.ability((user: User) => {
  return user.roleId === 'super_admin'
})
