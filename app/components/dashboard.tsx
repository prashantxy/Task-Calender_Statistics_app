'use client'

import { signOut } from 'next-auth/react'
import { CalendarEvent, CalendarStats } from '@/types/calender'
import { Session } from 'next-auth'
import { 
  Calendar, 
  Clock, 
  Users, 
  BarChart3, 
  RefreshCw, 
  LogOut,
  TrendingUp,
  CalendarDays,
  Timer,
  UserCheck
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

interface DashboardProps {
  stats: CalendarStats
  events: CalendarEvent[]
  session: Session | null
  onRefresh: () => void
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function Dashboard({ stats, events, session, onRefresh }: DashboardProps) {
  const pieData = [
    { name: 'Meetings with Guests', value: stats.meetingsWithGuests, color: '#3B82F6' },
    { name: 'Personal Events', value: stats.personalEvents, color: '#10B981' }
  ]

  const timeData = [
    { name: 'Morning', value: stats.timeDistribution.morning, color: '#F59E0B' },
    { name: 'Afternoon', value: stats.timeDistribution.afternoon, color: '#3B82F6' },
    { name: 'Evening', value: stats.timeDistribution.evening, color: '#8B5CF6' }
  ]

  const recurringData = [
    { name: 'Recurring', value: stats.recurringVsOneTime.recurring, color: '#10B981' },
    { name: 'One-time', value: stats.recurringVsOneTime.oneTime, color: '#06B6D4' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
  {/* Header */}
  <div className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
        <div className="flex items-center mb-3 sm:mb-0">
          <Calendar className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Calendar Statistics</h1>
            <p className="text-sm text-gray-500"> 
              Welcome, {session?.user?.name || session?.user?.email || 'User'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button onClick={onRefresh} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </button>
          <button onClick={() => signOut()} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Meetings with Guests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.meetingsWithGuests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Duration</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageDuration}m</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Busiest Day</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.busiestDay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-semibold text-blue-600">{stats.upcomingEvents}</p>
            <p className="text-sm text-gray-500 mt-1">In the next 7 days</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Free Hours</h3>
              <Timer className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-semibold text-green-600">{stats.meetingFreeHours}</p>
            <p className="text-sm text-gray-500 mt-1">Available working hours</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Events</h3>
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-semibold text-purple-600">{stats.personalEvents}</p>
            <p className="text-sm text-gray-500 mt-1">Events without guests</p>
          </div>
        </div>
        {/* Data Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Data Analysis Period</h3>
              <p className="mt-1 text-sm text-blue-700">
                Statistics are based on events from the last 30 days plus upcoming events for the next 7 days. 
                Total events analyzed: {stats.totalEvents}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}