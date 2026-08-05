import './global.css'
import { Geist, JetBrains_Mono } from 'next/font/google'

import { RootProvider } from 'fumadocs-ui/provider/next'

import PwaClient from '@/components/common/PwaClient'

import { appDescription, appName, baseUrl } from '@/lib/constants'
import { createMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = createMetadata({
  title: {
    template: `%s | ${appName}`,
    default: appName,
  },
  manifest: '/manifest.webmanifest', // ← Generated at build time from manifest.ts
  description: appDescription,
  metadataBase: baseUrl,
  appleWebApp: {
    title: appName,
  },
})

const geist = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geist.variable} ${mono.variable} "font-sans"`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <PwaClient />
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
