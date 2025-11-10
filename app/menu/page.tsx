import { MenuClient } from "@/components/menu-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const mockCategories = [
  {
    id: "1",
    name: "Tantuniler",
    slug: "tantuniler",
    display_order: 1,
    products: [
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
    ],
  },
  {
    id: "2",
    name: "İçecekler",
    slug: "icecekler",
    display_order: 2,
    products: [
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
    ],
  },
]

export default function MenuPage({ searchParams }: { searchParams: { table?: string } }) {
  const tableQR = searchParams.table

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-red-600">Menü</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <MenuClient categories={mockCategories} tableQR={tableQR} />
    </div>
  )
}
