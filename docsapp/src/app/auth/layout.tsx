import { Suspense } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen grid place-content-center bg-neutral-200">
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </div>
  )
}
