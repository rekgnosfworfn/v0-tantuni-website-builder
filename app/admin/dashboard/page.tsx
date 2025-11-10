"use client"

import { AdminDashboard } from "@/components/admin-dashboard"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Stats = {
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  todayDineIn: number
  todayTakeaway: number
  todayTotal: number
  todayRevenue: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem("admin_logged_in")
    if (!isLoggedIn) {
      router.push("/admin/login")
      return
    }

    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRecentOrders(data.recentOrders)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [router])

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

  const user = {
    id: "admin",
    email: sessionStorage.getItem("admin_email") || "admin@33mersintantuni.com",
    full_name: "Admin",
  }

  const displayStats = stats || {
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    todayDineIn: 0,
    todayTakeaway: 0,
    todayTotal: 0,
    todayRevenue: 0,
  }

  return <AdminDashboard user={user} stats={displayStats} recentOrders={recentOrders} />
}
