"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface NotionImportProps {
  postId?: string
}

export default function NotionImport({ postId }: NotionImportProps) {
  const router = useRouter()
  const [notionUrl, setNotionUrl] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = async () => {
    setIsImporting(true)
    try {
      const response = await fetch("/api/notion/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notionUrl, postId }),
      })

      if (response.ok) {
        const importedPost = await response.json()
        router.push(`/dashboard/posts/${importedPost.id}/edit`)
      } else {
        throw new Error("Failed to import from Notion")
      }
    } catch (error) {
      console.error("Error importing from Notion:", error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-lg font-semibold mb-4">Import from Notion</h2>
      <div className="flex space-x-4">
        <input
          type="text"
          value={notionUrl}
          onChange={(e) => setNotionUrl(e.target.value)}
          placeholder="Paste Notion page URL"
          className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <button
          onClick={handleImport}
          disabled={isImporting || !notionUrl}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isImporting ? "Importing..." : "Import"}
        </button>
      </div>
    </div>
  )
}