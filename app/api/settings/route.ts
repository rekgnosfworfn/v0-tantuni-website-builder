import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const settings = await request.json()

    // Update each setting
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from("site_settings").upsert({ key, value: value as string }, { onConflict: "key" }),
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
