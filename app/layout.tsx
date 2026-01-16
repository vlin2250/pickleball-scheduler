import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pickleball Weekly Signup',
  description: 'Weekly pickleball session signup app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
