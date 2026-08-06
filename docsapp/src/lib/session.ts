import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { isEmailAllowed } from '@/lib/utils'

export type Session = Awaited<ReturnType<typeof getAuthSession>>

/**
 * Returns the server session from `better-auth`
 */
export const getAuthSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  })
}

/**
 * Checks if the current active user in the session has an
 * email that's allowed to sign-in or access routes
 * @param session
 * @returns {boolean}
 */
export const isActiveUserAllowed = (session: Session) => {
  if (!session) return false

  return isEmailAllowed(session.user.email)
}
