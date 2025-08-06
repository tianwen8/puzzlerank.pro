import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  if (error) {
    console.error("Auth callback error:", error, error_description)
    return NextResponse.redirect(`${requestUrl.origin}?error=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${requestUrl.origin}?error=${encodeURIComponent(error.message)}`)
      }

      console.log("Successfully authenticated user:", data.user?.email)
    } catch (error) {
      console.error("Exception in auth callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}?error=authentication_failed`)
    }
  }

  // 重定向到主页
  return NextResponse.redirect(requestUrl.origin)
}
