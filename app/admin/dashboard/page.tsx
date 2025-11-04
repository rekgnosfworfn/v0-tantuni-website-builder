"use client"

import { AdminDashboard } from "@/components/admin-dashboard"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (simple check for demo)
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

  // Mock data for demo
  const mockUser = {
    id: "demo-user",
    email: "admin@33mersintantuni.com",
    full_name: "Admin",
  }

  const mockStats = {
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 6,
  }

  const mockRecentOrders: any[] = []

  return <AdminDashboard user={mockUser} stats={mockStats} recentOrders={mockRecentOrders} />
}
