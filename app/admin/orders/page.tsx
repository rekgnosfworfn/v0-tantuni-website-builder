"use client"

import { OrdersManagement } from "@/components/orders-management"
import { AdminHeader } from "@/components/admin-header"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type OrderItem = {
  id: string
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
}

type Order = {
  id: string
  order_number: string
  order_type: string
  total_amount: number
  status: string
  customer_notes: string | null
  created_at: string
  order_items: OrderItem[]
}

export default function OrdersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const supabase = createClient()

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("admin_logged_in")
    if (!isLoggedIn) {
      router.push("/admin/login")
      return
    }

    // Fetch initial orders
    fetchOrders()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("orders-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        console.log("New order received:", payload)
        // Fetch the complete order with items
        fetchOrderById(payload.new.id)
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        console.log("Order updated:", payload)
        // Update order in state
        setOrders((prev) =>
          prev.map((order) => (order.id === payload.new.id ? { ...order, ...(payload.new as any) } : order)),
        )
      })
      .subscribe()

    setIsLoading(false)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            product_name,
            product_price,
            quantity,
            subtotal
          )
        `,
        )
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        return
      }

      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchOrderById = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            product_name,
            product_price,
            quantity,
            subtotal
          )
        `,
        )
        .eq("id", orderId)
        .single()

      if (error) {
        console.error("Error fetching order:", error)
        return
      }

      if (data) {
        setOrders((prev) => [data, ...prev])
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const mockUser = {
    id: "demo-user",
    email: sessionStorage.getItem("admin_email") || "admin@33mersintantuni.com",
    full_name: "Admin",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={mockUser} />
      <div className="container mx-auto px-4 py-8">
        <OrdersManagement orders={orders} onRefresh={fetchOrders} />
      </div>
    </div>
  )
}
