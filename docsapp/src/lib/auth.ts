import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'

import { getHostedDomain } from '@/lib/utils'
import { getAllowedEmails } from '@/lib/utils'

import { AUTH_ERROR, B_STATUS_CODES, GOOGLEAPIS_USERINFO_URL } from '@/features/auth'

const singleHostedDomain = getHostedDomain()
const allowedEmails = getAllowedEmails()

// Better Auth settings
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Use Google's hosted domain parameter if a single email domain is specified
      // This restricts the account picker to only show accounts from that email domain
      ...(singleHostedDomain && { hd: singleHostedDomain }),

      getUserInfo: async (token) => {
        // Custom implementation to get user info
        const response = await fetch(GOOGLEAPIS_USERINFO_URL, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        })

        const profile = await response.json()

        if (!allowedEmails.includes(profile.email)) {
          throw new APIError(B_STATUS_CODES.FORBIDDEN, {
            message: AUTH_ERROR.ACCESS_DENIED,
          })
        }

        return {
          user: {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            emailVerified: profile.verified_email,
          },
          data: profile,
        }
      },
    },
  },
})
