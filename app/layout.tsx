import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const font = Noto_Sans_JP({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Custom Image Puzzle',
  description: 'Upload, generate, and solve sliding puzzles with custom images.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={font.className}>{children}</body>
    </html>
  )
}
