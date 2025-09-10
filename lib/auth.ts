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

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, trigger, session }) {
      console.log("JWT Callback Triggered:", {
        trigger,
        hasAccount: !!account,
      });
      if (account) {
        console.log("Storing tokens from account:", {
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
        });
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      if (trigger === "update" && session) {
        console.log("Updating JWT from session");
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback Triggered");
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
        console.log("Added accessToken to session");
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken as string;
        console.log("Added refreshToken to session");
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
