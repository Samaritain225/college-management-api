import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'access_tokens.store': { paramsTuple?: []; params?: {} }
    'access_tokens.refresh': { paramsTuple?: []; params?: {} }
    'access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'access_tokens.show': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.deactivate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.reactivate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'investors.index': { paramsTuple?: []; params?: {} }
    'investors.store': { paramsTuple?: []; params?: {} }
    'investors.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'expense_categories.index': { paramsTuple?: []; params?: {} }
    'expense_categories.store': { paramsTuple?: []; params?: {} }
    'expense_categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'expenses.index': { paramsTuple?: []; params?: {} }
    'expenses.store': { paramsTuple?: []; params?: {} }
    'expenses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'activities.index': { paramsTuple?: []; params?: {} }
    'roles.index': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'access_tokens.show': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'investors.index': { paramsTuple?: []; params?: {} }
    'expense_categories.index': { paramsTuple?: []; params?: {} }
    'expense_categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'expenses.index': { paramsTuple?: []; params?: {} }
    'expenses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'activities.index': { paramsTuple?: []; params?: {} }
    'roles.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'access_tokens.show': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'investors.index': { paramsTuple?: []; params?: {} }
    'expense_categories.index': { paramsTuple?: []; params?: {} }
    'expense_categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'expenses.index': { paramsTuple?: []; params?: {} }
    'expenses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'activities.index': { paramsTuple?: []; params?: {} }
    'roles.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'access_tokens.store': { paramsTuple?: []; params?: {} }
    'access_tokens.refresh': { paramsTuple?: []; params?: {} }
    'access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'investors.store': { paramsTuple?: []; params?: {} }
    'expense_categories.store': { paramsTuple?: []; params?: {} }
    'expenses.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'investors.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.deactivate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.reactivate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'investors.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}