import { Session } from '@/lib/session'

import SignOutButton from './BtnSignout'

export default async function SignOutLink({ session }: { session: Session }) {
  if (!session) {
    return null
  }

  const { email, image } = session?.user

  return (
    <SignOutButton
      title="Sign out"
      label={email as string}
      image={image as string}
    />
  )
}
