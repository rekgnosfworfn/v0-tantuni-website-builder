"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Siparişiniz Alındı!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Siparişiniz başarıyla oluşturuldu ve hazırlanmaya başlandı.</p>
          {orderNumber && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sipariş Numaranız:</p>
              <p className="text-2xl font-bold text-red-600">{orderNumber}</p>
            </div>
          )}
          <p className="text-sm text-gray-600">Siparişiniz hazır olduğunda size haber vereceğiz.</p>
          <Link href="/" className="block">
            <Button className="w-full bg-red-600 hover:bg-red-700">Ana Sayfaya Dön</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  )
}
