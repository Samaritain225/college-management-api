import { Bouncer } from '@adonisjs/bouncer'
import type Investor from '#models/investor'

/**
 * Check if the user can manage general investor users.
 * Allowed: 'admin' and 'super_admin'
 */
export const manageUsers = Bouncer.ability((user: Investor) => {
  return user.role === 'admin' || user.role === 'super_admin'
})

/**
 * Check if the user can manage admin/super_admin accounts.
 * Allowed: 'super_admin' only
 */
export const manageAdmins = Bouncer.ability((user: Investor) => {
  return user.role === 'super_admin'
})
