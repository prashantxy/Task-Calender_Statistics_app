'use client'

import { useSession } from 'next-auth/react'
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

      const response = await fetch('/api/calender/events')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch calendar events')
      }

      const calendarEvents = data.events
      setEvents(calendarEvents)
      
      const calculatedStats = analyzeCalendarEvents(calendarEvents)
      setStats(calculatedStats)
    } catch (err) {
      console.error('Error fetching calendar data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCalendarData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return <LoadingSpinner />
  }

  return <Dashboard stats={stats} events={events} session={session} onRefresh={fetchCalendarData} />
}