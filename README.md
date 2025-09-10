# Calendar Statistics App

A Next.js 15 application that connects to your Google Calendar and provides detailed statistics and insights about your scheduling patterns.

## Features

- **Google OAuth Integration**: Secure authentication with Google
- **Comprehensive Statistics**: 
  - Total events and meeting counts
  - Average meeting duration
  - Busiest day identification
  - Time distribution analysis (morning/afternoon/evening)
  - Weekly distribution patterns
  - Meeting vs personal event breakdown
  - Recurring vs one-time events
  - Upcoming events tracking
  - Meeting-free time calculation

- **Visual Analytics**: Interactive charts and graphs using Recharts
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Data**: Fresh calendar data with refresh functionality

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Authentication**: NextAuth.js v4
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Package Manager**: pnpm

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm
- Google Cloud Console project with Calendar API enabled

### Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd calendar-stats-app
pnpm install
```

2. **Create Google OAuth App:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Calendar API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

3. **Environment Variables:**
```bash
cp .env.example .env.local
```

Fill in your values:
```env
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_SECRET_KEY=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Run the development server:**
```bash
pnpm dev
```

Visit `http://localhost:3000`

## Deployment on Vercel

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel:**
   - Connect your GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Update `NEXTAUTH_URL` to your Vercel domain
   - Update Google OAuth redirect URLs to include your Vercel domain

3. **Update Google OAuth settings:**
   - Add your Vercel domain to authorized origins
   - Add `https://yourdomain.vercel.app/api/auth/callback/google` to redirect URIs

## Project Structure

```
calendar-stats-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── calendar/events/route.ts
│   ├── auth/signin/page.tsx
│   ├── components/
│   │   ├── dashboard.tsx
│   │   ├── loading-spinner.tsx
│   │   └── session-provider.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts
│   └── calendar-utils.ts
├── types/
│   ├── calendar.ts
│   └── next-auth.d.ts
├── auth.ts
├── middleware.ts
└── package.json
```

## Key Components

- **Authentication**: NextAuth.js with Google provider
- **Data Fetching**: Google Calendar API integration
- **Analytics**: Custom calendar event analysis functions
- **UI**: Responsive dashboard with interactive charts
- **Security**: Secure token handling and API routes

## Statistics Provided

1. **Basic Metrics**: Total events, meetings with guests, personal events
2. **Time Analysis**: Average duration, busiest day, time distribution
3. **Pattern Recognition**: Weekly distribution, recurring vs one-time events
4. **Productivity Insights**: Meeting-free hours, upcoming events

## Development Notes

- Uses Next.js 15 App Router for modern React patterns
- NextAuth.js v5 for enhanced authentication
- TypeScript for type safety
- Tailwind CSS for rapid UI development
- Recharts for data visualization
- Google Calendar API for real-time data

## Troubleshooting

**Authentication Issues:**
- Verify Google OAuth credentials
- Check redirect URLs match exactly
- Ensure Calendar API is enabled

**Data Loading Issues:**
- Check calendar permissions
- Verify API scopes in Google Console
- Review browser console for errors

**Build Issues:**
- Ensure all dependencies are installed with `pnpm install`
- Check TypeScript errors with `pnpm build`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.