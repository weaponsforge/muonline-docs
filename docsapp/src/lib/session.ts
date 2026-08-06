import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { getAllowedEmails, getMultipleHostedDomains } from '@/lib/utils'

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
 * Checks if a user email in the session is allowed to sign-in
 * @param session
 * @returns {boolean}
 */
export const isUserAllowed = (session: Session) => {
  if (!session) return false
  const email = session.user.email.toLowerCase().trim()

  if (!email || !email.includes('@')) {
    return false
  }

  const allowedDomains = getMultipleHostedDomains()
  const allowedEmails = getAllowedEmails()
  const domain = email.split('@')[1]

  const isAllowedDomain =
    allowedDomains.length === 0
      ? true // If no domains specified, allow all domains
      : allowedDomains.includes(domain)

  // Check email restriction (if ALLOWED_EMAILS is set)
  const isAllowedEmail =
      allowedEmails.length === 0
        ? true // If no emails specified, allow all emails
        : allowedEmails.includes(email)

  return isAllowedDomain && isAllowedEmail
}
