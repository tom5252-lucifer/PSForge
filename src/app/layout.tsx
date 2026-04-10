import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PSforge — PeopleSoft Developer Studio',
  description: 'PeopleCode IDE with AI Assistant powered by Claude',
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
