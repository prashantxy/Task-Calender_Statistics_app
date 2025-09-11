'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";
import { CalendarEvent, CalendarStats } from '@/types/calender'
import { analyzeCalendarEvents } from '@/lib/calender-utils'
import Dashboard from './components/dashboard'
import LoadingSpinner from './components/loading-spinner'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [stats, setStats] = useState<CalendarStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchCalendarData()
  }, [session, status, router])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(' Fetching calendar data...')
      console.log('Session exists:', !!session)
      console.log('Access token exists:', !!(session as any)?.accessToken)

      const response = await fetch('/api/calender/events')
      const data = await response.json()
      
      console.log('📡 API Response:', response.status, data)

      if (!response.ok) {
        
        if (response.status === 401 && data.requireReauth) {
          console.log(' Re-authentication required')
          
          throw new Error('Authentication expired - please sign in again')
        }
        
        throw new Error(data.message || 'Failed to fetch calendar events')
      }

      const calendarEvents = data.events
      console.log('📅 Received events:', calendarEvents?.length || 0)
      
      setEvents(calendarEvents)
      
      const calculatedStats = analyzeCalendarEvents(calendarEvents)
      setStats(calculatedStats)
    } catch (err) {
      console.error('❌ Error fetching calendar data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleForceReauth = async () => {
    console.log('🔄 Force re-authentication requested')
    await signIn('google', { 
      callbackUrl: window.location.href,
      redirect: true 
    })
  }

  if (status === 'loading' || loading) {
    return <LoadingSpinner />
  }

  if (error) {
    const isAuthError = error.includes('Unauthorized') || error.includes('sign in')
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">
            {isAuthError ? '🔐' : '⚠️'}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isAuthError ? 'Authentication Required' : 'Error Loading Data'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            {isAuthError ? (
              <button
                onClick={handleForceReauth}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                Sign In Again
              </button>
            ) : (
              <button
                onClick={fetchCalendarData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return <LoadingSpinner />
  }

  return <Dashboard stats={stats} events={events} session={session} onRefresh={fetchCalendarData} />
}