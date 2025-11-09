import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all admin users
    const { data: users, error } = await supabase
      .from("admin_users")
      .select("*")

    if (error) {
      return NextResponse.json({
        error: error.message,
        details: error,
      })
    }

    // Don't show password hashes in production, but for debugging we need to see if they exist
    const debugUsers = users?.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      has_password_hash: !!user.password_hash,
      password_hash_length: user.password_hash?.length || 0,
      created_at: user.created_at,
    }))

    return NextResponse.json({
      success: true,
      count: users?.length || 0,
      users: debugUsers,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({
      error: "Debug endpoint failed",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
