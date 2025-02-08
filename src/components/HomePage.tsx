'use client'
import { describe } from 'node:test'
import Header from './Header'
import Navbar from './Navbar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import NotionConnect from './NotionConnect'

export default async  function Home1() {
  
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const notionToken = await prisma.notionToken.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar session={session} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        {notionToken ? (
          <div>
            <p className="text-green-600 mb-4">Your Notion account is connected!</p>
            {/* Add components for managing blog posts here */}
          </div>
        ) : (
          <NotionConnect />
        )}
      </main>
    </div>
  )
}