"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface NotionLinkFormProps {
  postId: string
  initialNotionPageUrl?: string
}

export default function NotionLinkForm({ postId, initialNotionPageUrl }: NotionLinkFormProps) {
  const router = useRouter()
  const [notionUrl, setNotionUrl] = useState(initialNotionPageUrl || "")
  const [isLinking, setIsLinking] = useState(false)

  const handleLink = async () => {
    setIsLinking(true)
    try {
      const response = await fetch("/api/notion/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notionUrl, postId }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        throw new Error("Failed to link Notion page")
      }
    } catch (error) {
      console.error("Error linking Notion page:", error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-lg font-semibold mb-4">Link to Notion Page</h2>
      <div className="flex space-x-4">
        <input
          type="text"
          value={notionUrl}
          onChange={(e) => setNotionUrl(e.target.value)}
          placeholder="Paste Notion page URL"
          className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <button
          onClick={handleLink}
          disabled={isLinking || !notionUrl}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLinking ? "Linking..." : initialNotionPageUrl ? "Update Link" : "Link"}
        </button>
      </div>
    </div>
  )
}

