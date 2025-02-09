import { getServerSession } from "next-auth/next"

import { redirect } from "next/navigation"

import Navbar from "@/components/Navbar"
import { authOptions } from "@/lib/auth/auth"
import prisma from "@/lib/prisma"
import PostEditor from "@/components/PostEditor"
import NotionImport from "@/components/NotionImport"


export default async function EditPost({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const post =
    params.id === "new"
      ? null
      : await prisma.blog.findUnique({
          where: { id: params.id },
        })

  if (params.id !== "new" && (!post || post.authorId !== session.user.id)) {
    redirect("/dashboard")
  }

  const notionToken = await prisma.notionToken.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{post ? "Edit Post" : "Create New Post"}</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <PostEditor initialPost={post} />
          {notionToken && <NotionImport postId={post?.id} />}
        </div>
      </main>
    </div>
  )
}

