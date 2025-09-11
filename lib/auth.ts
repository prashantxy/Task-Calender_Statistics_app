import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Load client ID/secret from env
const clientId =
  process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const clientSecret =
  process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

// Fail fast if missing
if (!clientId || !clientSecret) {
  throw new Error("Missing Google OAuth client ID or secret in environment variables");
}

// Mask secret for logging (avoid leaking full secret)
const maskedSecret = `${clientSecret.slice(0, 4)}...${clientSecret.slice(-4)}`;

console.log("Env Check - Google Client ID:", clientId);
console.log("Env Check - Google Client Secret (masked):", maskedSecret);
console.log("Env Check - NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

// Helper: refresh Google access token
async function refreshAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token";

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    console.log("Access token refreshed successfully");

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // fallback to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in
      if (account) {
        console.log("JWT Callback - New login, storing tokens");
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + account.expires_at! * 1000;
        return token;
      }

      // Return current token if not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        console.log("JWT Callback - Existing token still valid");
        return token;
      }

      // Otherwise, refresh it
      console.log("JWT Callback - Access token expired, refreshing...");
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      console.log("Session Callback Triggered");

      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
        console.log("Added accessToken to session");
      }
      if (token.refreshToken) {
        (session as any).refreshToken = token.refreshToken;
        console.log("Added refreshToken to session");
      }
      if (token.error) {
        (session as any).error = token.error;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
