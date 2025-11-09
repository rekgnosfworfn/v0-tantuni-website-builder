import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt:", { email })

    // Validate input
    if (!email || !password) {
      console.log("Validation failed: missing credentials")
      return NextResponse.json(
        { error: "Email ve şifre gereklidir" },
        { status: 400 }
      )
    }

    // Get Supabase client
    const supabase = await createClient()

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .single()

    console.log("Database query result:", {
      found: !!user,
      error: userError?.message,
      hasPasswordHash: !!user?.password_hash
    })

    if (userError || !user) {
      console.log("User not found:", userError?.message)
      return NextResponse.json(
        { error: "Email veya şifre hatalı", debug: userError?.message },
        { status: 401 }
      )
    }

    // Check if password_hash exists
    if (!user.password_hash) {
      console.log("Password hash is missing for user:", email)
      return NextResponse.json(
        { error: "Kullanıcı şifresi ayarlanmamış. Lütfen SQL script'ini çalıştırın." },
        { status: 401 }
      )
    }

    // Verify password
    console.log("Verifying password...")
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log("Password match:", passwordMatch)

    if (!passwordMatch) {
      console.log("Password verification failed")
      return NextResponse.json(
        { error: "Email veya şifre hatalı" },
        { status: 401 }
      )
    }

    // Create session token (simple JWT alternative)
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: user.id,
        username: user.username,
        email: user.email,
        timestamp: Date.now(),
      })
    ).toString("base64")

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Giriş yapılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}
