export interface CalendarEvent {
  id?: string
  summary?: string
  description?: string
  start?: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end?: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  attendees?: Array<{
    email?: string
    displayName?: string
    responseStatus?: string
  }>
  creator?: {
    email?: string
    displayName?: string
  }
  organizer?: {
    email?: string
    displayName?: string
  }
  recurringEventId?: string
  status?: string
  location?: string
}

export interface CalendarStats {
  totalEvents: number
  meetingsWithGuests: number
  personalEvents: number
  averageDuration: number
  busiestDay: string
  timeDistribution: {
    morning: number
    afternoon: number
    evening: number
  }
  weeklyDistribution: Array<{
    day: string
    count: number
  }>
  recurringVsOneTime: {
    recurring: number
    oneTime: number
  }
  upcomingEvents: number
  meetingFreeHours: number
}