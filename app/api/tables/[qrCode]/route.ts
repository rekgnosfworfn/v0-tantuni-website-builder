import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch table by QR code
export async function GET(request: NextRequest, { params }: { params: { qrCode: string } }) {
  try {
    const supabase = await createClient()
    const qrCode = params.qrCode

    const { data: table, error } = await supabase.from("tables").select("*").eq("qr_code", qrCode).single()

    if (error) {
      console.error("Error fetching table:", error)
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    if (!table.is_active) {
      return NextResponse.json({ error: "Table is not active" }, { status: 400 })
    }

    return NextResponse.json({ table })
  } catch (error) {
    console.error("Error in GET table by QR:", error)
    return NextResponse.json({ error: "Failed to fetch table" }, { status: 500 })
  }
}
