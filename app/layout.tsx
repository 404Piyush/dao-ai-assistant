import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'DAO AI Assistant',
  description: 'AI-powered governance assistant for DAOs',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </div>
      </body>
    </html>
  )
} 