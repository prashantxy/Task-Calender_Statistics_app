import { CalendarEvent, CalendarStats } from '@/types/calender'
import { format, parse, differenceInMinutes, isAfter, startOfWeek, format as formatDate } from 'date-fns'

export function analyzeCalendarEvents(events: CalendarEvent[]): CalendarStats {
  const now = new Date()
  const validEvents = events.filter(event => 
    event.start?.dateTime || event.start?.date
  )

  // Basic counts
  const totalEvents = validEvents.length
  const meetingsWithGuests = validEvents.filter(event => 
    event.attendees && event.attendees.length > 0
  ).length
  const personalEvents = totalEvents - meetingsWithGuests
  
  // Upcoming events
  const upcomingEvents = validEvents.filter(event => {
    const startTime = new Date(event.start?.dateTime || event.start?.date || '')
    return isAfter(startTime, now)
  }).length

  // Average duration calculation
  const durationsInMinutes = validEvents
    .filter(event => event.start?.dateTime && event.end?.dateTime)
    .map(event => {
      const start = new Date(event.start!.dateTime!)
      const end = new Date(event.end!.dateTime!)
      return differenceInMinutes(end, start)
    })
  
  const averageDuration = durationsInMinutes.length > 0 
    ? Math.round(durationsInMinutes.reduce((sum, duration) => sum + duration, 0) / durationsInMinutes.length)
    : 0

  // Weekly distribution
  const weeklyCount: { [key: string]: number } = {
    'Monday': 0,
    'Tuesday': 0,
    'Wednesday': 0,
    'Thursday': 0,
    'Friday': 0,
    'Saturday': 0,
    'Sunday': 0
  }

  // Time distribution
  const timeDistribution = {
    morning: 0,   // 6 AM - 12 PM
    afternoon: 0, // 12 PM - 6 PM
    evening: 0    // 6 PM - 11 PM
  }

  validEvents.forEach(event => {
    if (event.start?.dateTime) {
      const startTime = new Date(event.start.dateTime)
      const dayName = format(startTime, 'EEEE')
      const hour = startTime.getHours()
      
      weeklyCount[dayName]++
      
      if (hour >= 6 && hour < 12) {
        timeDistribution.morning++
      } else if (hour >= 12 && hour < 18) {
        timeDistribution.afternoon++
      } else if (hour >= 18 && hour < 23) {
        timeDistribution.evening++
      }
    }
  })

  const weeklyDistribution = Object.entries(weeklyCount).map(([day, count]) => ({
    day: day.slice(0, 3), // Shorten to 3 letters
    count
  }))

  // Find busiest day
  const busiestDay = Object.entries(weeklyCount).reduce((max, [day, count]) =>
    count > max.count ? { day, count } : max,
    { day: '', count: 0 }
  ).day

  // Recurring vs one-time events
  const recurringEvents = validEvents.filter(event => event.recurringEventId).length
  const oneTimeEvents = totalEvents - recurringEvents

  const recurringVsOneTime = {
    recurring: recurringEvents,
    oneTime: oneTimeEvents
  }

  // Calculate meeting-free hours (rough estimate)
  const totalWorkingHours = 30 * 8 // Assuming 8 hours/day for 30 days
  const totalMeetingHours = Math.round(durationsInMinutes.reduce((sum, duration) => sum + duration, 0) / 60)
  const meetingFreeHours = Math.max(0, totalWorkingHours - totalMeetingHours)

  return {
    totalEvents,
    meetingsWithGuests,
    personalEvents,
    averageDuration,
    busiestDay,
    timeDistribution,
    weeklyDistribution,
    recurringVsOneTime,
    upcomingEvents,
    meetingFreeHours
  }
}