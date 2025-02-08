'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Feather, ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-pink-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Feather className="mx-auto h-12 w-12 text-blue-600" />
              </motion.div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Sign in to Daily Journee
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Start your journaling journey today
              </p>
            </div>

            <div className="mt-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  onClick={() => signIn('google')}
                  variant="outline"
                  className="w-full py-3 px-4 flex items-center justify-center space-x-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </Button>
              </motion.div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 sm:px-10">
            <p className="text-xs leading-5 text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href='/auth/signup'
            className='font-medium text-blue-600 hover:text-blue-500'
          >
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}