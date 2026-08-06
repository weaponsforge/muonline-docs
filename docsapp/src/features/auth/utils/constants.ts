// Auth codes for code=? params
export const AUTH_CODE = {
  SIGN_IN: 'signin',
  SIGN_OUT: 'signout',
  ERROR: 'error',
}

// Auth search params
export const AUTH_QUERY = {
  CODE: 'code',
  CALLBACK_URL: 'callbackURL',
  ERROR: 'error',
}

// Better Auth APIError status codes
export const B_STATUS_CODES = {
  FORBIDDEN: 'FORBIDDEN',
} as const

// Custom string error code values
export const AUTH_ERROR = {
  ACCESS_DENIED: 'AccessDenied',
}

// Auth routes
export const AUTH_ROUTES = {
  SIGNIN: '/auth/signin',
  ACCESS_DENIED: '/auth/error',
  ACCESS_DENIED_FULL: `/auth/error?error=${AUTH_ERROR.ACCESS_DENIED}`,
}

export const GOOGLEAPIS_USERINFO_URL =
  'https://www.googleapis.com/oauth2/v2/userinfo'
