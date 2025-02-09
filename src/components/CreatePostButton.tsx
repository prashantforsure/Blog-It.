"use client"

import { Plus } from "lucide-react"
import Link from "next/link"

export default function CreatePostButton() {
  return (
    <Link
      href="/dashboard/posts/new"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <Plus className="mr-2 h-5 w-5" />
      Create New Post
    </Link>
  )
}

