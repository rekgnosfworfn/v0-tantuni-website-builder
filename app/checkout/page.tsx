"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    } else {
      router.push("/menu")
    }
  }, [router])

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType,
          items: cart,
          notes,
          totalAmount: getTotalPrice(),
        }),
      })

      if (!response.ok) throw new Error("Failed to create order")

      const { orderId, orderNumber } = await response.json()

      // Clear cart
      sessionStorage.removeItem("cart")

      // Redirect to confirmation
      router.push(`/order-confirmation?orderNumber=${orderNumber}`)
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/menu">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Menüye Dön
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-red-600">Sipariş Özeti</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x {item.price.toFixed(2)} ₺
                      </p>
                    </div>
                    <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} ₺</p>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Toplam:</span>
                    <span className="text-red-600">{getTotalPrice().toFixed(2)} ₺</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Type */}
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Tipi</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={orderType} onValueChange={(value) => setOrderType(value as "dine-in" | "takeaway")}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="dine-in" id="dine-in" />
                  <Label htmlFor="dine-in" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-semibold">İç Mekandan Sipariş</p>
                      <p className="text-sm text-gray-600">Restoranımızda yemek yiyeceksiniz</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="takeaway" id="takeaway" />
                  <Label htmlFor="takeaway" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-semibold">Gel-Al</p>
                      <p className="text-sm text-gray-600">Siparişinizi alıp gideceksiniz</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Notu (Opsiyonel)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            {isSubmitting ? "Sipariş Oluşturuluyor..." : "Siparişi Onayla"}
          </Button>
        </div>
      </div>
    </div>
  )
}
