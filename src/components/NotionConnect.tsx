"use client"
import { useState } from "react"

export default function NotionConnect() {
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notion/connect")
      const data = await response.json()
      window.location.href = data.url
    } catch (error) {
      console.error("Error connecting to Notion:", error)
      setIsLoading(false)
    }
  }

  return (
    <div>
      <p className="mb-4">Connect your Notion account to start creating blog posts.</p>
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
      >
        {isLoading ? "Connecting..." : "Connect Notion"}
      </button>
    </div>
  )
}

