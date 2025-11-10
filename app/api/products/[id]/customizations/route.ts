import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch customizations for a product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const productId = params.id

    const { data: customizations, error } = await supabase
      .from("product_customizations")
      .select(
        `
        *,
        customization_options (
          id,
          label,
          price_adjustment,
          is_default,
          display_order
        )
      `,
      )
      .eq("product_id", productId)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching customizations:", error)
      throw error
    }

    // Sort options within each customization
    const sortedCustomizations = customizations?.map((c) => ({
      ...c,
      customization_options: c.customization_options?.sort((a: any, b: any) => a.display_order - b.display_order),
    }))

    return NextResponse.json({ customizations: sortedCustomizations || [] })
  } catch (error) {
    console.error("Error in GET customizations:", error)
    return NextResponse.json({ error: "Failed to fetch customizations" }, { status: 500 })
  }
}

// POST - Create a new customization for a product
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const productId = params.id
    const body = await request.json()
    const { name, type, is_required, options } = body

    // Create customization
    const { data: customization, error: customizationError } = await supabase
      .from("product_customizations")
      .insert({
        product_id: productId,
        name,
        type,
        is_required: is_required || false,
        display_order: 0,
      })
      .select()
      .single()

    if (customizationError) {
      console.error("Error creating customization:", customizationError)
      throw customizationError
    }

    // Create options if provided
    if (options && options.length > 0) {
      const optionsData = options.map((opt: any, index: number) => ({
        customization_id: customization.id,
        label: opt.label,
        price_adjustment: opt.price_adjustment || 0,
        is_default: opt.is_default || false,
        display_order: index,
      }))

      const { error: optionsError } = await supabase.from("customization_options").insert(optionsData)

      if (optionsError) {
        console.error("Error creating options:", optionsError)
        throw optionsError
      }
    }

    return NextResponse.json({ success: true, customization })
  } catch (error) {
    console.error("Error in POST customization:", error)
    return NextResponse.json({ error: "Failed to create customization" }, { status: 500 })
  }
}

// DELETE - Delete a customization
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const customizationId = searchParams.get("customizationId")

    if (!customizationId) {
      return NextResponse.json({ error: "Customization ID required" }, { status: 400 })
    }

    const { error } = await supabase.from("product_customizations").delete().eq("id", customizationId)

    if (error) {
      console.error("Error deleting customization:", error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE customization:", error)
    return NextResponse.json({ error: "Failed to delete customization" }, { status: 500 })
  }
}
