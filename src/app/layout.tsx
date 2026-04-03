import type { Metadata } from 'next'
import { Cormorant_Garamond, Lato } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['300', '400', '700'],
})

export const metadata: Metadata = {
  title: 'Amani — Beautiful Wedding Invitations',
  description: 'Create beautiful online wedding invitations and manage your gift registry.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${lato.variable} font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
