'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, BarChart3, Clock, Users } from 'lucide-react'

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getSession().then(session => {
      if (session) {
        router.push('/')
      }
    })
  }, [router])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Calendar Statistics
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Discover insights about your Google Calendar events
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 my-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Event Analytics</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Time Insights</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Meeting Stats</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Schedule Overview</p>
          </div>
        </div>

        <div>
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </div>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">
          We only access your calendar data to generate statistics. 
          Your data is not stored or shared.
        </p>
      </div>
    </div>
  )
}