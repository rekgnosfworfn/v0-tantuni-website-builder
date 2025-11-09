import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Mevcut şifre ve yeni şifre gereklidir" },
        { status: 400 }
      )
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Yeni şifre en az 6 karakter olmalıdır" },
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

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", sessionData.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Mevcut şifre hatalı" },
        { status: 401 }
      )
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password in database
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionData.userId)

    if (updateError) {
      console.error("Password update error:", updateError)
      return NextResponse.json(
        { error: "Şifre güncellenirken bir hata oluştu" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Şifre başarıyla değiştirildi",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Şifre değiştirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
