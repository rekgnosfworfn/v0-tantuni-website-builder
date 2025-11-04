"use client"

import { SettingsManagement } from "@/components/settings-management"
import { AdminHeader } from "@/components/admin-header"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
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

  const mockSettings = {
    site_name: "33 Mersin Tantuni",
    site_logo: "",
    site_favicon: "",
    primary_color: "#DC2626",
    secondary_color: "#F59E0B",
    welcome_text: "Mersin'in En Lezzetli Tantunisi",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={mockUser} />
      <div className="container mx-auto px-4 py-8">
        <SettingsManagement settings={mockSettings} />
      </div>
    </div>
  )
}
