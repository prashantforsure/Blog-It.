'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Feather, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { UserAccountNav } from './UserAccountNav'
export default function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleAuthAction = () => {
    if (session) {
      signOut()
    } else {
      signIn()
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r backdrop-blur-md  border-b border-gray-100 sticky top-0 z-50"
    >
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Feather className="h-8 w-8 " />
            <span className="ml-2 text-xl font-bold text-gradient-to-r from-blue-600 to-purple-600" style={{ fontFamily: '"Agatha", cursive' }}>Daily Journee</span>
          </Link>
          <div className="flex items-center space-x-6">
            
          <div className='flex items-center gap-4'>
          {session?.user ? (
            <>
              <div className="hidden md:flex items-center gap-4">
               
               
              </div>
              
              <UserAccountNav user={{
                ...session.user,
                image: session.user.image ?? "",
                name: session.user.name ?? "",   
                email: session.user.email ?? ""  
              }} />
            </>
          ) : (
            <Link href='/auth/signin'>
              <Button 
                variant="ghost" 
                className='rounded-md px-6 py-2 text-white bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:-translate-y-0.5'
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
            
          </div>
        </div>
      </nav>
    </motion.header>
  )
}