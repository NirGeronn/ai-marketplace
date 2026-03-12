import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: string }).role as "VIEWER" | "SOLUTION_OWNER" | "ADMIN" ?? "VIEWER";
        token.department = (user as { department?: string | null }).department ?? null;
      }
      // Extract department from Okta profile claims if available
      if (profile) {
        const dept = (profile as Record<string, unknown>).department as string | undefined;
        if (dept) token.department = dept;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "VIEWER" | "SOLUTION_OWNER" | "ADMIN";
        session.user.department = token.department as string | null;
      }
      return session;
    },
  },
});
