import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const providers: NextAuthConfig["providers"] = [];

// Only add Okta if credentials are configured
if (process.env.AUTH_OKTA_ID && process.env.AUTH_OKTA_SECRET && process.env.AUTH_OKTA_ISSUER) {
  // Dynamic import to avoid errors when not configured
  providers.push({
    id: "okta",
    name: "Okta",
    type: "oidc",
    issuer: process.env.AUTH_OKTA_ISSUER,
    clientId: process.env.AUTH_OKTA_ID,
    clientSecret: process.env.AUTH_OKTA_SECRET,
    authorization: {
      params: {
        scope: "openid profile email",
      },
    },
  });
}

// Credentials provider for development and testing
providers.push(
  Credentials({
    name: "Dev Login",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "admin@appsflyer.com" },
      name: { label: "Name", type: "text", placeholder: "Admin User" },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;
      return {
        id: credentials.email as string,
        email: credentials.email as string,
        name: (credentials.name as string) || "Dev User",
        department: "AI",
        role: "ADMIN" as const,
      };
    },
  })
);

export default {
  providers,
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
