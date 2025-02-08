import Link from "next/link"
import type { Session } from "next-auth"
import SignOutButton from "./SignOutButton"


interface NavbarProps {
  session: Session | null
}

export default function Navbar({ session }: NavbarProps) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            BlogNotion
          </Link>
          <div>
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
                  Dashboard
                </Link>
                <SignOutButton />
              </div>
            ) : (
              <Link href="/signin" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

