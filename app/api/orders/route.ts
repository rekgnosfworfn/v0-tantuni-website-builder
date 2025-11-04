import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { orderType, items, notes, totalAmount } = body

    // Generate order number
    const { data: orderNumberData, error: orderNumberError } = await supabase.rpc("generate_order_number")

    if (orderNumberError) {
      console.error("[v0] Error generating order number:", orderNumberError)
      throw orderNumberError
    }

    const orderNumber = orderNumberData

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        order_type: orderType,
        total_amount: totalAmount,
        customer_notes: notes || null,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) {
      console.error("[v0] Error creating order:", orderError)
      throw orderError
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[v0] Error creating order items:", itemsError)
      throw itemsError
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error) {
    console.error("[v0] Error in order creation:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
