import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

interface ExtendedSession {
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("🔴 Failed to refresh token:", refreshedTokens);
      throw new Error(refreshedTokens.error || "Failed to refresh token");
    }

    console.log("✅ Successfully refreshed access token");
    
    return {
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token,
    };
  } catch (error) {
    console.error("❌ Error refreshing access token:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as ExtendedSession | null;
    console.log("🔍 Session in /events:", !!session?.accessToken, !!session?.refreshToken);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized - No session found" }, { status: 401 });
    }

    if (session.error === "RefreshAccessTokenError") {
      return NextResponse.json({ 
        message: "Unauthorized - Please sign in again", 
        requireReauth: true 
      }, { status: 401 });
    }

    let accessToken = session.accessToken;

    // If we don't have an access token but have a refresh token, try to refresh
    if (!accessToken && session.refreshToken) {
      console.log("🔄 No access token, attempting to refresh...");
      try {
        const refreshed = await refreshAccessToken(session.refreshToken);
        accessToken = refreshed.accessToken;
      } catch (error) {
        console.error("❌ Failed to refresh token in API route:", error);
        return NextResponse.json({ 
          message: "Unauthorized - Please sign in again", 
          requireReauth: true 
        }, { status: 401 });
      }
    }

    if (!accessToken) {
      return NextResponse.json({ 
        message: "Unauthorized - No access token available", 
        requireReauth: true 
      }, { status: 401 });
    }

    // Set up Google Calendar client
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: authClient });

    // Time window: last 30 days → next 7 days
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 30);

    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 7);

    console.log(`📅 Fetching events from ${timeMin.toISOString()} to ${timeMax.toISOString()}`);

    try {
      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: 1000,
        singleEvents: true,
        orderBy: "startTime",
      });

      console.log(`✅ Successfully fetched ${response.data.items?.length || 0} events`);
      return NextResponse.json({ events: response.data.items || [] });

    } catch (googleError: any) {
      console.error("❌ Google API Error:", googleError);
      
      // If it's an auth error and we have a refresh token, try one more time
      if (googleError.status === 401 && session.refreshToken && accessToken === session.accessToken) {
        console.log("🔄 Auth error detected, attempting token refresh...");
        try {
          const refreshed = await refreshAccessToken(session.refreshToken);
          authClient.setCredentials({ access_token: refreshed.accessToken });
          
          const retryResponse = await calendar.events.list({
            calendarId: "primary",
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            maxResults: 1000,
            singleEvents: true,
            orderBy: "startTime",
          });

          console.log(`✅ Retry successful: fetched ${retryResponse.data.items?.length || 0} events`);
          return NextResponse.json({ events: retryResponse.data.items || [] });
          
        } catch (retryError) {
          console.error("❌ Retry failed:", retryError);
          return NextResponse.json({ 
            message: "Unauthorized - Please sign in again", 
            requireReauth: true 
          }, { status: 401 });
        }
      }
      
      throw googleError;
    }

  } catch (error: any) {
    console.error("❌ Error in calendar events API:", error);
    
    if (error.status === 401) {
      return NextResponse.json({ 
        message: "Unauthorized - Please sign in again", 
        requireReauth: true 
      }, { status: 401 });
    }
    
    return NextResponse.json(
      { 
        message: "Error fetching calendar events", 
        error: error.message || "Unknown error" 
      },
      { status: 500 }
    );
  }
}