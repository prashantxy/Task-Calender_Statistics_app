import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

interface ExtendedSession {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

export async function GET(request: NextRequest) {
  try {
    
    const session = (await getServerSession(authOptions)) as ExtendedSession | null;

    if (!session?.accessToken) {
      return NextResponse.json(
        { message: "Unauthorized - No access token" },
        { status: 401 }
      );
    }

    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({
      access_token: session.accessToken,
    });

    const calendar = google.calendar({ version: "v3", auth: authClient });

    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 30);

    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 7);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 1000,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      {
        message: "Error fetching calendar events",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
