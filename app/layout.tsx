import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Custom Image Puzzle',
  description: 'AI-powered custom image sliding puzzle game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
