import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import Header from '@/components/Header'
import Loader from '@/components/Loader'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'ClassyChain - Premium Shoe Store',
  description: 'Your destination for premium shoes and footwear',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Loader />
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}

