"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"

type AdminUser = {
  id: string
  email: string
  full_name: string | null
}

type Stats = {
  totalOrders: number
  pendingOrders: number
  totalProducts: number
}

type Order = {
  id: string
  order_number: string
  order_type: string
  total_amount: number
  status: string
  created_at: string
}

export function AdminDashboard({
  user,
  stats,
  recentOrders,
}: {
  user: AdminUser
  stats: Stats
  recentOrders: Order[]
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    // Clear session storage
    sessionStorage.removeItem("admin_logged_in")
    sessionStorage.removeItem("admin_email")
    router.push("/admin/login")
    router.refresh()
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: "Bekliyor", className: "bg-yellow-100 text-yellow-800" },
      preparing: { label: "Hazırlanıyor", className: "bg-blue-100 text-blue-800" },
      ready: { label: "Hazır", className: "bg-green-100 text-green-800" },
      completed: { label: "Tamamlandı", className: "bg-gray-100 text-gray-800" },
      cancelled: { label: "İptal", className: "bg-red-100 text-red-800" },
    }

    const statusInfo = statusMap[status] || statusMap.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>{statusInfo.label}</span>
    )
  }

  const getOrderTypeLabel = (type: string) => {
    return type === "dine-in" ? "İç Mekan" : "Gel-Al"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-red-600">Yönetim Paneli</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.full_name || user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                <span className="mr-2">↗</span>
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Quick Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Toplam Sipariş</CardTitle>
              <span className="text-2xl">📋</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Bekleyen Siparişler</CardTitle>
              <span className="text-2xl">🛒</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aktif Ürünler</CardTitle>
              <span className="text-2xl">📦</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hızlı Erişim</CardTitle>
              <span className="text-2xl">⚡</span>
            </CardHeader>
            <CardContent>
              <Link href="/admin/orders">
                <Button variant="secondary" size="sm" className="w-full">
                  Siparişleri Görüntüle
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <div>
                    <CardTitle>Sipariş Yönetimi</CardTitle>
                    <p className="text-sm text-gray-600">Siparişleri görüntüle ve yönet</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <CardTitle>Ürün Yönetimi</CardTitle>
                    <p className="text-sm text-gray-600">Menü ürünlerini düzenle</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/media">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <span className="text-2xl">🖼️</span>
                  </div>
                  <div>
                    <CardTitle>Medya Kütüphanesi</CardTitle>
                    <p className="text-sm text-gray-600">Görselleri yönet</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div>
                    <CardTitle>Site Ayarları</CardTitle>
                    <p className="text-sm text-gray-600">Tema ve site ayarları</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/admin/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <CardTitle>Profil Ayarları</CardTitle>
                    <p className="text-sm text-gray-600">Email, kullanıcı adı ve şifre değiştir</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Son Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Henüz sipariş bulunmuyor</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">#{order.order_number}</p>
                        {getStatusBadge(order.status)}
                        <span className="text-sm text-gray-600">{getOrderTypeLabel(order.order_type)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{new Date(order.created_at).toLocaleString("tr-TR")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{order.total_amount.toFixed(2)} ₺</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
