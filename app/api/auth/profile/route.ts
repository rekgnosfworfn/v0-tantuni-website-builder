import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function PUT(request: Request) {
  try {
    const { email, username, full_name } = await request.json()

    // Validate input
    if (!email || !username) {
      return NextResponse.json(
        { error: "Email ve kullanıcı adı gereklidir" },
        { status: 400 }
      )
    }

    // Get session from cookie
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 })
    }

    // Decode session token to get user ID
    const sessionData = JSON.parse(
      Buffer.from(sessionToken, "base64").toString()
    )

    // Get Supabase client
    const supabase = await createClient()

    // Check if email is already taken by another user
    const { data: emailCheck, error: emailCheckError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .neq("id", sessionData.userId)
      .single()

    if (emailCheck) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Check if username is already taken by another user
    const { data: usernameCheck, error: usernameCheckError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("username", username)
      .neq("id", sessionData.userId)
      .single()

    if (usernameCheck) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from("admin_users")
      .update({
        email,
        username,
        full_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionData.userId)
      .select()
      .single()

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json(
        { error: "Profil güncellenirken bir hata oluştu" },
        { status: 500 }
      )
    }

    // Update session cookie with new data
    const newSessionToken = Buffer.from(
      JSON.stringify({
        userId: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        timestamp: Date.now(),
      })
    ).toString("base64")

    cookieStore.set("admin_session", newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Profil güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
