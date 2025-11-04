"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("admin_logged_in")
    if (!isLoggedIn) {
      router.push("/admin/login")
    } else {
      router.push("/admin/dashboard")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Yönlendiriliyor...</p>
    </div>
  )
}
