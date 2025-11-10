"use client"

import { AdminHeader } from "@/components/admin-header"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type WaiterCall = {
  id: string
  table_id: string
  table_number: number
  status: "pending" | "acknowledged" | "completed"
  note: string | null
  created_at: string
  acknowledged_at: string | null
  completed_at: string | null
}

export default function WaiterCallsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [calls, setCalls] = useState<WaiterCall[]>([])
  const supabase = createClient()

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("admin_logged_in")
    if (!isLoggedIn) {
      router.push("/admin/login")
      return
    }

    // Fetch initial calls
    fetchCalls()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("waiter-calls-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "waiter_calls" }, (payload) => {
        console.log("New waiter call:", payload)
        setCalls((prev) => [payload.new as WaiterCall, ...prev])
        // Play sound or show notification
        playNotificationSound()
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "waiter_calls" }, (payload) => {
        console.log("Waiter call updated:", payload)
        setCalls((prev) => prev.map((call) => (call.id === payload.new.id ? (payload.new as WaiterCall) : call)))
      })
      .subscribe()

    setIsLoading(false)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  const fetchCalls = async () => {
    try {
      const response = await fetch("/api/waiter-calls")
      if (response.ok) {
        const data = await response.json()
        setCalls(data.calls || [])
      }
    } catch (error) {
      console.error("Error fetching waiter calls:", error)
    }
  }

  const playNotificationSound = () => {
    // Simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"
      gainNode.gain.value = 0.3

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  const updateCallStatus = async (callId: string, status: string) => {
    try {
      const response = await fetch("/api/waiter-calls", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: callId, status }),
      })

      if (response.ok) {
        await fetchCalls()
      }
    } catch (error) {
      console.error("Error updating call status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: "Bekliyor", className: "bg-red-100 text-red-800 animate-pulse" },
      acknowledged: { label: "Kabul Edildi", className: "bg-blue-100 text-blue-800" },
      completed: { label: "Tamamlandı", className: "bg-green-100 text-green-800" },
    }

    const statusInfo = statusMap[status] || statusMap.pending
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Şimdi"
    if (diffMins === 1) return "1 dakika önce"
    if (diffMins < 60) return `${diffMins} dakika önce`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return "1 saat önce"
    if (diffHours < 24) return `${diffHours} saat önce`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "1 gün önce"
    return `${diffDays} gün önce`
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
    id: "admin",
    email: sessionStorage.getItem("admin_email") || "admin@33mersintantuni.com",
    full_name: "Admin",
  }

  const pendingCalls = calls.filter((c) => c.status === "pending")
  const acknowledgedCalls = calls.filter((c) => c.status === "acknowledged")
  const completedCalls = calls.filter((c) => c.status === "completed")

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={mockUser} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Garson Çağrıları</h2>
            <p className="text-sm text-gray-600 mt-1">
              🔴 Canlı - Yeni çağrılar otomatik görünür
              {pendingCalls.length > 0 && (
                <span className="ml-2 font-semibold text-red-600">({pendingCalls.length} bekliyor)</span>
              )}
            </p>
          </div>
          <Button onClick={fetchCalls} variant="outline" size="sm">
            🔄 Yenile
          </Button>
        </div>

        {/* Pending Calls - Priority */}
        {pendingCalls.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-red-600">⚠️ Bekleyen Çağrılar ({pendingCalls.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingCalls.map((call) => (
                <Card key={call.id} className="border-2 border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-2xl">🔔</span>
                      {getStatusBadge(call.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center py-4">
                      <p className="text-3xl font-bold text-red-600">Masa {call.table_number}</p>
                      <p className="text-sm text-gray-600 mt-1">{getTimeAgo(call.created_at)}</p>
                    </div>

                    {call.note && (
                      <div className="bg-white p-2 rounded text-sm">
                        <p className="text-gray-600">Not: {call.note}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => updateCallStatus(call.id, "acknowledged")}
                      >
                        ✓ Kabul Et
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => updateCallStatus(call.id, "completed")}
                      >
                        ✓ Tamamla
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Acknowledged Calls */}
        {acknowledgedCalls.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Kabul Edilen Çağrılar ({acknowledgedCalls.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {acknowledgedCalls.map((call) => (
                <Card key={call.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">Masa {call.table_number}</span>
                      {getStatusBadge(call.status)}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{getTimeAgo(call.created_at)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => updateCallStatus(call.id, "completed")}
                    >
                      ✓ Tamamla
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Calls - Last 10 */}
        {completedCalls.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-600">
              Son Tamamlanan Çağrılar ({completedCalls.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {completedCalls.slice(0, 10).map((call) => (
                <Card key={call.id} className="opacity-60">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Masa {call.table_number}</span>
                      <Badge variant="secondary" className="text-xs">
                        ✓
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{getTimeAgo(call.created_at)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Calls */}
        {calls.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              <p className="text-4xl mb-4">🔔</p>
              <p>Henüz garson çağrısı bulunmuyor</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
