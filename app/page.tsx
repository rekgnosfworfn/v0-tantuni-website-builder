import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
          {/* Logo */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-xl ring-4 ring-orange-200">
            <Image src="/tantuni-restaurant-logo.jpg" alt="33 Mersin Tantuni" fill className="object-cover" priority />
          </div>

          {/* Site Name */}
          <h1 className="text-4xl md:text-6xl font-bold text-center text-red-700 text-balance">33 Mersin Tantuni</h1>

          {/* Welcome Text */}
          <p className="text-xl md:text-2xl text-center text-gray-700 max-w-2xl text-pretty">
            Mersin'in En Lezzetli Tantunisi
          </p>

          {/* Menu Button */}
          <Link href="/menu">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Menüyü Görüntüle
            </Button>
          </Link>

          {/* Admin Link */}
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mt-8 transition-colors">
            Yönetici Girişi
          </Link>
        </div>
      </div>
    </main>
  )
}
