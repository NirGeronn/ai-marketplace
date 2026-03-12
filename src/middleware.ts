import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For the POC, we allow all routes through.
  // Auth checks are handled at the page/API level via the auth() function.
  // In production, configure Okta SSO with proper middleware protection.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
