import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

async function refreshAccessToken(token: any) {
  try {
    console.log(" Attempting to refresh access token...");
    console.log("Has refresh token:", !!token.refreshToken);
    
    if (!token.refreshToken) {
      throw new Error("No refresh token available");
    }
    
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
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();
    console.log(" Refresh response status:", response.status);

    if (!response.ok) {
      console.error(" Failed to refresh token:", refreshedTokens);
      throw new Error(refreshedTokens.error || "Failed to refresh token");
    }

    console.log(" Successfully refreshed access token");
    console.log("New token expires in:", refreshedTokens.expires_in, "seconds");

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error(" Error refreshing access token:", error);
    
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      console.log("🔑 JWT Callback triggered");
      console.log("Is initial login:", !!account);
      console.log("Current token expires:", token.accessTokenExpires ? new Date(token.accessTokenExpires as number) : 'Never');
      console.log("Current time:", new Date());
      
      if (account && user) {
        console.log(" Initial sign in - storing tokens");
        console.log("Has refresh_token:", !!account.refresh_token);
        console.log("Access token expires at:", new Date((account.expires_at as number) * 1000));
        
        if (!account.refresh_token) {
          console.warn(" WARNING: No refresh token received! This might cause auth issues.");
        }
        
        return {
          accessToken: account.access_token,
          accessTokenExpires: (account.expires_at as number) * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }
      const buffer = 5 * 60 * 1000; // 5 minutes
      const tokenExpiresAt = token.accessTokenExpires as number;
      const timeUntilExpiry = tokenExpiresAt - Date.now();
      
      console.log("Time until token expiry:", Math.round(timeUntilExpiry / 1000 / 60), "minutes");
      
      if (Date.now() < (tokenExpiresAt - buffer)) {
        console.log("Token still valid, returning existing token");
        return token;
      }

      console.log(" Token expired or expiring soon, refreshing...");
      
      // Check if we have a refresh token
      if (!token.refreshToken) {
        console.error(" No refresh token available for refresh");
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }

      // Refresh the access token
      return await refreshAccessToken(token);
    },
    
    async session({ session, token }) {
      console.log("🔍 Session callback");
      console.log("Has access token:", !!token.accessToken);
      console.log("Has refresh token:", !!token.refreshToken);
      console.log("Has error:", !!token.error);
      
      session.user = token.user as any;
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session as any).error = token.error;
      
      return session;
    },
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  debug: process.env.NODE_ENV === "development",
};