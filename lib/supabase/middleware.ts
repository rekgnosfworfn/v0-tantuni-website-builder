import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()

  // Only check auth for admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return response
  }

  // Skip auth check for login page
  if (request.nextUrl.pathname === "/admin/login") {
    return response
  }

  const accessToken = request.cookies.get("sb-access-token")?.value

  // If no access token, redirect to login
  if (!accessToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  // Verify token with Supabase
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken)

  // If token is invalid, redirect to login
  if (error || !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  return response
}
