import './globals.css'
import  { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from './components/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Calendar Statistics Dashboard',
  description: 'Analyze your Google Calendar events with detailed statistics and insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}