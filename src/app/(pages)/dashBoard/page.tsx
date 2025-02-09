import { getServerSession } from "next-auth/next"

import { redirect } from "next/navigation"

import Navbar from "@/components/Navbar"

import NotionConnect from "@/components/NotionConnect"
import { Suspense } from "react"
import { authOptions } from "@/lib/auth/auth"
import prisma from "@/lib/prisma"
import DashboardHeader from "@/components/DashboardHeader"
import CreatePostButton from "@/components/CreatePostButton"
import LoadingSpinner from "@/components/LoadingSpinner"
import BlogPostList from "@/components/BlogPostList"


export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const notionToken = await prisma.notionToken.findUnique({
    where: { userId: session.user.id },
  })

  const blogPosts = await prisma.blog.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <main className="container mx-auto px-4 py-8">
        <DashboardHeader username={session.user.name || "User"} />
        {notionToken ? (
          <>
            <div className="mb-8">
              <CreatePostButton />
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <BlogPostList posts={blogPosts} />
            </Suspense>
          </>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Notion Account</h2>
            <p className="text-gray-600 mb-6">
              To start creating and managing your blog posts, you need to connect your Notion account first.
            </p>
            <NotionConnect />
          </div>
        )}
      </main>
    </div>
  )
}

