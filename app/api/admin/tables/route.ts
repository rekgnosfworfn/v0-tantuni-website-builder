import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch all tables
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: tables, error } = await supabase.from("tables").select("*").order("table_number", { ascending: true })

    if (error) {
      console.error("Error fetching tables:", error)
      throw error
    }

    return NextResponse.json({ tables: tables || [] })
  } catch (error) {
    console.error("Error in GET tables:", error)
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 })
  }
}

// POST - Create a new table
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { table_number, table_name, location, capacity } = body

    // Generate unique QR code
    const qr_code = `QR_TABLE_${String(table_number).padStart(3, "0")}`

    const { data: table, error } = await supabase
      .from("tables")
      .insert({
        table_number,
        table_name: table_name || `Masa ${table_number}`,
        qr_code,
        location: location || "İç Mekan",
        capacity: capacity || 4,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating table:", error)
      throw error
    }

    return NextResponse.json({ success: true, table })
  } catch (error) {
    console.error("Error in POST table:", error)
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 })
  }
}

// PATCH - Update a table
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updates } = body

    const { data: table, error } = await supabase
      .from("tables")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating table:", error)
      throw error
    }

    return NextResponse.json({ success: true, table })
  } catch (error) {
    console.error("Error in PATCH table:", error)
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 })
  }
}

// DELETE - Delete a table
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Table ID required" }, { status: 400 })
    }

    const { error } = await supabase.from("tables").delete().eq("id", id)

    if (error) {
      console.error("Error deleting table:", error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE table:", error)
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 })
  }
}
