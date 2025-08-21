import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token"); // or session cookie

  // Protect specific routes
  const protectedPaths = ["/portal", "/services", "/student", "/markingSetup"];
  const isProtected = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Apply middleware to these routes
export const config = {
  matcher: ["/portal/:path*", "/services/:path*", "/student/:path*", "/markingSetup/:path*"],
};
