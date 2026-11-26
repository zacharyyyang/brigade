import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { LookProvider } from '@/components/look-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { THEME_FIRST_PAINT } from '@/lib/theme-runtime'
import { themeFontHrefs } from './theme-fonts'
import './globals.css'

export const metadata: Metadata = {
  // Makes the link preview's address (app/opengraph-image.png) absolute, as sites that read it need.
  metadataBase: new URL('https://www.brigade.lol'),
  title: 'Brigade',
  description: 'The control plane for a business run with AI teammates.',
  // Added to the Home Screen, it opens as an app: the only way an iPhone gets notifications.
  appleWebApp: { capable: true, title: 'Brigade', statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  // iOS zooms in on a field under 16px as it takes focus; this stops it (pinching still zooms).
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfdfd' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1b1e' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        {/* The theme's own sans is replaced by Geist and General Sans (globals.css), so it is not loaded. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
        />
        {themeFontHrefs
          .filter((href) => !href.includes('Plus+Jakarta+Sans'))
          .map((href) => (
            <link key={href} rel="stylesheet" href={href} />
          ))}
        {/* A worn theme's colours from the first paint (docs/themes.md). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_FIRST_PAINT }} />
      </head>
      <body suppressHydrationWarning>
        <LookProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </LookProvider>
      </body>
    </html>
  )
}
