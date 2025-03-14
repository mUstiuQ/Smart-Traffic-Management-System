import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import React from 'react';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Traffic Management System',
  description: 'AI-powered urban traffic optimization with OpenCV, cryptocurrency payments, and environmental monitoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}