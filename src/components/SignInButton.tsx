"use client"

import { signIn } from "next-auth/react"

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
    >
      Sign in with Google
    </button>
  )
}
