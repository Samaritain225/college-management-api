/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  accessTokens: {
    store: typeof routes['access_tokens.store']
    refresh: typeof routes['access_tokens.refresh']
    destroy: typeof routes['access_tokens.destroy']
    show: typeof routes['access_tokens.show']
  }
  users: {
    index: typeof routes['users.index']
    store: typeof routes['users.store']
    update: typeof routes['users.update']
    deactivate: typeof routes['users.deactivate']
    reactivate: typeof routes['users.reactivate']
  }
  investors: {
    index: typeof routes['investors.index']
    store: typeof routes['investors.store']
    update: typeof routes['investors.update']
  }
  expenseCategories: {
    index: typeof routes['expense_categories.index']
    store: typeof routes['expense_categories.store']
    show: typeof routes['expense_categories.show']
  }
  expenses: {
    index: typeof routes['expenses.index']
    store: typeof routes['expenses.store']
    show: typeof routes['expenses.show']
  }
  activities: {
    index: typeof routes['activities.index']
  }
  roles: {
    index: typeof routes['roles.index']
  }
}
