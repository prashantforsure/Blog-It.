import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Menu
} from 'lucide-react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { UserAccountNav } from '@/components/UserAccountNav'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'



const Navbar = async () => {
    const session = await getServerSession(authOptions)

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
         
              <div className="md:hidden mr-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <nav className="flex flex-col gap-4 mt-8">
                      <Link href="/courses">
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-6 py-2 text-sm hover:text-[#A259FF] transition-colors"
                        >
                          Courses
                        </Button>
                      </Link>
                      <Link href='/about'>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-6 py-2 text-sm hover:text-[#A259FF] transition-colors"
                      >
                        About
                      </Button>
                      </Link>
                   
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-6 py-2 text-sm hover:text-[#A259FF] transition-colors"
                      >
                        Contact
                      </Button>
                      <Link href="https://play.google.com/store/apps/details?id=co.jarvis.pgap">
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-6 py-2 text-sm hover:text-[#A259FF] transition-colors"
                        >
                          Mobile App
                        </Button>
                      </Link>

                     
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>


              <div className="flex items-center space-x-8">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  <Link href="/">PG Ayurved.</Link>
                </span>
                <div className="hidden md:flex space-x-6">
                  <Button variant="ghost">
                    <Link href="/courses">Courses</Link>
                  </Button>
                  <Button variant="ghost">About</Button>
                  <Button variant="ghost">Contact</Button>
                  <Button variant="ghost">
                    <Link href="https://play.google.com/store/apps/details?id=co.jarvis.pgap">
                      Mobile App
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {session ? (
                <>
                

                  <UserAccountNav
                    user={{
                      ...session.user,
                      image: session.user.image ?? "",
                      name: session.user.name ?? "",
                      email: session.user.email ?? ""
                    }}
                  />
                </>
              ) : (
              
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    className="px-6 py-2 text-white bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:-translate-y-0.5"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar