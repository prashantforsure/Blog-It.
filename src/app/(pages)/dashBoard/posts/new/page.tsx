import { getServerSession } from "next-auth/next"

import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"

import { authOptions } from "@/lib/auth/auth"
import PostForm from "@/components/PostForm"
import NotionImport from "@/components/NotionImport"

export default async function CreatePost() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <PostForm />
          <NotionImport />
        </div>
      </main>
    </div>
  )
}

