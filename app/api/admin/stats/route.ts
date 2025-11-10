import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get today's date range (start and end of day in local timezone)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get total orders count
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })

    // Get pending orders count
    const { count: pendingOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // Get total products count
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })

    // Get today's orders
    const { data: todayOrders } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString())

    // Calculate today's stats
    const todayDineIn = todayOrders?.filter((o) => o.order_type === "dine-in").length || 0
    const todayTakeaway = todayOrders?.filter((o) => o.order_type === "takeaway").length || 0
    const todayTotal = todayOrders?.length || 0
    const todayRevenue = todayOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

    // Get recent orders (last 10)
    const { data: recentOrders } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_name,
          quantity,
          product_price,
          subtotal
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      stats: {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalProducts: totalProducts || 0,
        todayDineIn,
        todayTakeaway,
        todayTotal,
        todayRevenue,
      },
      recentOrders: recentOrders || [],
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
