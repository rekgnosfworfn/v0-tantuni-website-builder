import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch all waiter calls (for admin)
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: calls, error } = await supabase
      .from("waiter_calls")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching waiter calls:", error)
      throw error
    }

    return NextResponse.json({ calls: calls || [] })
  } catch (error) {
    console.error("Error in GET waiter calls:", error)
    return NextResponse.json({ error: "Failed to fetch waiter calls" }, { status: 500 })
  }
}

// POST - Create a new waiter call (from customer)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { table_id, table_number, note } = body

    if (!table_id || !table_number) {
      return NextResponse.json({ error: "Table information required" }, { status: 400 })
    }

    const { data: call, error } = await supabase
      .from("waiter_calls")
      .insert({
        table_id,
        table_number,
        note: note || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating waiter call:", error)
      throw error
    }

    return NextResponse.json({ success: true, call })
  } catch (error) {
    console.error("Error in POST waiter call:", error)
    return NextResponse.json({ error: "Failed to create waiter call" }, { status: 500 })
  }
}

// PATCH - Update waiter call status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 })
    }

    const updates: any = {
      status,
    }

    if (status === "acknowledged") {
      updates.acknowledged_at = new Date().toISOString()
    } else if (status === "completed") {
      updates.completed_at = new Date().toISOString()
    }

    const { data: call, error } = await supabase.from("waiter_calls").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating waiter call:", error)
      throw error
    }

    return NextResponse.json({ success: true, call })
  } catch (error) {
    console.error("Error in PATCH waiter call:", error)
    return NextResponse.json({ error: "Failed to update waiter call" }, { status: 500 })
  }
}
