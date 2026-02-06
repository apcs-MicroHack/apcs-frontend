import React from "react"
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'APCS - Algiers Port Container Service',
  description: 'Maritime logistics platform for Algiers port operations, booking management, and container services.',
}

export const viewport = {
  themeColor: '#0f2140',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_inter.variable} ${_poppins.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
