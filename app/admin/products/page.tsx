"use client"

import { ProductsManagement } from "@/components/products-management"
import { AdminHeader } from "@/components/admin-header"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProductsPage() {
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

  const mockCategories = [
    { id: "1", name: "Tantuniler", slug: "tantuniler", display_order: 1 },
    { id: "2", name: "İçecekler", slug: "icecekler", display_order: 2 },
  ]

  const mockProducts = [
    {
      id: "1",
      category_id: "1",
      name: "Klasik Tantuni",
      description: "Geleneksel Mersin tantunisi",
      price: 85.0,
      image_url: "/tantuni.jpg",
      is_available: true,
      display_order: 1,
    },
    {
      id: "2",
      category_id: "1",
      name: "Acılı Tantuni",
      description: "Baharatlarla zenginleştirilmiş tantuni",
      price: 90.0,
      image_url: "/spicy-tantuni.jpg",
      is_available: true,
      display_order: 2,
    },
    {
      id: "3",
      category_id: "1",
      name: "Kaşarlı Tantuni",
      description: "Bol kaşar peynirli tantuni",
      price: 95.0,
      image_url: "/cheese-tantuni.jpg",
      is_available: true,
      display_order: 3,
    },
    {
      id: "4",
      category_id: "2",
      name: "Ayran",
      description: "Ev yapımı ayran",
      price: 15.0,
      image_url: "/ayran.jpg",
      is_available: true,
      display_order: 1,
    },
    {
      id: "5",
      category_id: "2",
      name: "Kola",
      description: "Soğuk kola",
      price: 20.0,
      image_url: "/refreshing-cola.png",
      is_available: true,
      display_order: 2,
    },
    {
      id: "6",
      category_id: "2",
      name: "Şalgam",
      description: "Acılı şalgam suyu",
      price: 15.0,
      image_url: "/turnip-juice.jpg",
      is_available: true,
      display_order: 3,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={mockUser} />
      <div className="container mx-auto px-4 py-8">
        <ProductsManagement categories={mockCategories} products={mockProducts} />
      </div>
    </div>
  )
}
