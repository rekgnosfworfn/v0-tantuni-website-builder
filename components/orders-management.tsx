"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export function OrdersManagement({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState<string>("all")

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update order")

      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Sipariş güncellenirken bir hata oluştu.")
    }
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
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
  }

  const getOrderTypeLabel = (type: string) => {
    return type === "dine-in" ? "İç Mekan" : "Gel-Al"
  }

  const filteredOrders = filter === "all" ? orders : orders.filter((order) => order.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Sipariş Yönetimi</h2>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Tümü ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">Bekliyor ({orders.filter((o) => o.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="preparing">
            Hazırlanıyor ({orders.filter((o) => o.status === "preparing").length})
          </TabsTrigger>
          <TabsTrigger value="ready">Hazır ({orders.filter((o) => o.status === "ready").length})</TabsTrigger>
          <TabsTrigger value="completed">
            Tamamlandı ({orders.filter((o) => o.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">Bu kategoride sipariş bulunmuyor</CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <span>#{order.order_number}</span>
                        {getStatusBadge(order.status)}
                        <Badge variant="outline">{getOrderTypeLabel(order.order_type)}</Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{new Date(order.created_at).toLocaleString("tr-TR")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{order.total_amount.toFixed(2)} ₺</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Sipariş Detayları:</h4>
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="font-medium">{item.subtotal.toFixed(2)} ₺</span>
                      </div>
                    ))}
                  </div>

                  {/* Customer Notes */}
                  {order.customer_notes && (
                    <div className="bg-gray-50 p-3 rounded">
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Müşteri Notu:</h4>
                      <p className="text-sm text-gray-600">{order.customer_notes}</p>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="flex items-center gap-3 pt-3 border-t">
                    <span className="text-sm font-medium">Durum Güncelle:</span>
                    <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Bekliyor</SelectItem>
                        <SelectItem value="preparing">Hazırlanıyor</SelectItem>
                        <SelectItem value="ready">Hazır</SelectItem>
                        <SelectItem value="completed">Tamamlandı</SelectItem>
                        <SelectItem value="cancelled">İptal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
