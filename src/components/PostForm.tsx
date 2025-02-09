"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Blog } from "@prisma/client"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

interface PostFormProps {
  initialPost?: Blog
}

export default function PostForm({ initialPost }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialPost?.title || "")
  const [content, setContent] = useState(initialPost?.content || "")
  const [slug, setSlug] = useState(initialPost?.slug || "")
  const [published, setPublished] = useState(initialPost?.published || false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!slug && title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      )
    }
  }, [title, slug])

  const handleSave = async (publishStatus: boolean) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/posts", {
        method: initialPost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialPost?.id,
          title,
          content,
          slug,
          published: publishStatus,
        }),
      })

      if (response.ok) {
        const savedPost = await response.json()
        router.push("/dashboard")
      } else {
        throw new Error("Failed to save post")
      }
    } catch (error) {
      console.error("Error saving post:", error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Slug
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <ReactQuill value={content} onChange={setContent} className="mt-1 block w-full" theme="snow" />
      </div>
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save as Draft
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialPost?.published ? "Update" : "Publish"}
        </button>
      </div>
    </div>
  )
}