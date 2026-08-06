import { createAuthClient } from 'better-auth/client'

const {
  signIn: signInMethod,
  signOut: signOutMethod,
} = createAuthClient()

// Better Auth client-side methods
export const signIn = async (callbackURL: string = '/') => {
  await signInMethod.social({
    provider: 'google',
    callbackURL,
  })
}

export const signOut = async () => {
  return await signOutMethod()
}
