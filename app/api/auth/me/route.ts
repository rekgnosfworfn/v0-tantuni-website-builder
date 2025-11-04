import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 })
    }

    // Decode session token
    const sessionData = JSON.parse(
      Buffer.from(sessionToken, "base64").toString()
    )

    // Check if session is expired (7 days)
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - sessionData.timestamp > sevenDays) {
      return NextResponse.json({ error: "Oturum süresi dolmuş" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: sessionData.userId,
        username: sessionData.username,
        email: sessionData.email,
      },
    })
  } catch (error) {
    console.error("Session verification error:", error)
    return NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 })
  }
}
