"use client"

import { OrdersManagement } from "@/components/orders-management"
import { AdminHeader } from "@/components/admin-header"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("admin_logged_in")
    if (!isLoggedIn) {
      router.push("/admin/login")
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    )
  }

  const mockUser = {
    id: "demo-user",
    email: sessionStorage.getItem("admin_email") || "admin@33mersintantuni.com",
    full_name: "Admin",
  }

  const mockOrders: any[] = []

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={mockUser} />
      <div className="container mx-auto px-4 py-8">
        <OrdersManagement orders={mockOrders} />
      </div>
    </div>
  )
}
