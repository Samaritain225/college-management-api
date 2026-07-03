/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['access_tokens.store']['types'],
  },
  'access_tokens.refresh': {
    methods: ["POST"],
    pattern: '/api/v1/auth/refresh',
    tokens: [{"old":"/api/v1/auth/refresh","type":0,"val":"api","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"refresh","end":""}],
    types: placeholder as Registry['access_tokens.refresh']['types'],
  },
  'access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['access_tokens.destroy']['types'],
  },
  'access_tokens.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/me',
    tokens: [{"old":"/api/v1/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['access_tokens.show']['types'],
  },
  'users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/users',
    tokens: [{"old":"/api/v1/users","type":0,"val":"api","end":""},{"old":"/api/v1/users","type":0,"val":"v1","end":""},{"old":"/api/v1/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['users.index']['types'],
  },
  'users.store': {
    methods: ["POST"],
    pattern: '/api/v1/users',
    tokens: [{"old":"/api/v1/users","type":0,"val":"api","end":""},{"old":"/api/v1/users","type":0,"val":"v1","end":""},{"old":"/api/v1/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['users.store']['types'],
  },
  'users.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/users/:id',
    tokens: [{"old":"/api/v1/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['users.update']['types'],
  },
  'users.deactivate': {
    methods: ["PATCH"],
    pattern: '/api/v1/users/:id/deactivate',
    tokens: [{"old":"/api/v1/users/:id/deactivate","type":0,"val":"api","end":""},{"old":"/api/v1/users/:id/deactivate","type":0,"val":"v1","end":""},{"old":"/api/v1/users/:id/deactivate","type":0,"val":"users","end":""},{"old":"/api/v1/users/:id/deactivate","type":1,"val":"id","end":""},{"old":"/api/v1/users/:id/deactivate","type":0,"val":"deactivate","end":""}],
    types: placeholder as Registry['users.deactivate']['types'],
  },
  'users.reactivate': {
    methods: ["PATCH"],
    pattern: '/api/v1/users/:id/reactivate',
    tokens: [{"old":"/api/v1/users/:id/reactivate","type":0,"val":"api","end":""},{"old":"/api/v1/users/:id/reactivate","type":0,"val":"v1","end":""},{"old":"/api/v1/users/:id/reactivate","type":0,"val":"users","end":""},{"old":"/api/v1/users/:id/reactivate","type":1,"val":"id","end":""},{"old":"/api/v1/users/:id/reactivate","type":0,"val":"reactivate","end":""}],
    types: placeholder as Registry['users.reactivate']['types'],
  },
  'investors.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/investors',
    tokens: [{"old":"/api/v1/investors","type":0,"val":"api","end":""},{"old":"/api/v1/investors","type":0,"val":"v1","end":""},{"old":"/api/v1/investors","type":0,"val":"investors","end":""}],
    types: placeholder as Registry['investors.index']['types'],
  },
  'investors.store': {
    methods: ["POST"],
    pattern: '/api/v1/investors',
    tokens: [{"old":"/api/v1/investors","type":0,"val":"api","end":""},{"old":"/api/v1/investors","type":0,"val":"v1","end":""},{"old":"/api/v1/investors","type":0,"val":"investors","end":""}],
    types: placeholder as Registry['investors.store']['types'],
  },
  'investors.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/investors/:id',
    tokens: [{"old":"/api/v1/investors/:id","type":0,"val":"api","end":""},{"old":"/api/v1/investors/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/investors/:id","type":0,"val":"investors","end":""},{"old":"/api/v1/investors/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['investors.update']['types'],
  },
  'roles.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/roles',
    tokens: [{"old":"/api/v1/roles","type":0,"val":"api","end":""},{"old":"/api/v1/roles","type":0,"val":"v1","end":""},{"old":"/api/v1/roles","type":0,"val":"roles","end":""}],
    types: placeholder as Registry['roles.index']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
