import { APIError } from 'better-auth/api'
import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/lib/auth'

import { AUTH_ERROR, AUTH_ROUTES } from '@/features/auth'

const {
  POST: betterAuthPOST,
  GET: betterAuthGET,
} = toNextJsHandler(auth)

async function handleAuthError(
  request: Request,
  handler: () => Promise<Response>,
) {
  try {
    const response = await handler()

    // better-auth returns a 403 status APIError on 'FORBIDDEN'
    if (response.status === 403) {
      return Response.redirect(
        new URL(AUTH_ROUTES.ACCESS_DENIED_FULL, request.url),
        302,
      )
    }

    return response
  } catch (error) {
    if (
      error instanceof APIError &&
      error.body?.message === AUTH_ERROR.ACCESS_DENIED
    ) {
      return Response.redirect(
        new URL(AUTH_ROUTES.ACCESS_DENIED_FULL, request.url),
        302,
      )
    }

    throw error
  }
}

export async function GET(request: Request) {
  return handleAuthError(
    request,
    () => betterAuthGET(request),
  )
}

export async function POST(request: Request) {
  return handleAuthError(
    request,
    () => betterAuthPOST(request),
  )
}
