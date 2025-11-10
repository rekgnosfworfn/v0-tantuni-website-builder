"use client"

import { AdminHeader } from "@/components/admin-header"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Table = {
  id: string
  table_number: number
  table_name: string
  qr_code: string
  is_active: boolean
  capacity: number
  location: string
}

export default function TablesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [tables, setTables] = useState<Table[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState({
    table_number: "",
    table_name: "",
    location: "İç Mekan",
    capacity: "4",
  })

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("admin_logged_in")
    if (!isLoggedIn) {
      router.push("/admin/login")
      return
    }

    fetchTables()
  }, [router])

  const fetchTables = async () => {
    try {
      const response = await fetch("/api/admin/tables")
      if (response.ok) {
        const data = await response.json()
        setTables(data.tables || [])
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_number: parseInt(formData.table_number),
          table_name: formData.table_name,
          location: formData.location,
          capacity: parseInt(formData.capacity),
        }),
      })

      if (response.ok) {
        await fetchTables()
        setIsDialogOpen(false)
        setFormData({ table_number: "", table_name: "", location: "İç Mekan", capacity: "4" })
      } else {
        alert("Masa oluşturulurken hata oluştu")
      }
    } catch (error) {
      console.error("Error creating table:", error)
      alert("Masa oluşturulurken hata oluştu")
    }
  }

  const toggleTableStatus = async (table: Table) => {
    try {
      const response = await fetch("/api/admin/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: table.id,
          is_active: !table.is_active,
        }),
      })

      if (response.ok) {
        await fetchTables()
      }
    } catch (error) {
      console.error("Error updating table:", error)
    }
  }

  const showQRCode = (table: Table) => {
    setSelectedTable(table)
    setQrDialogOpen(true)
  }

  const getQRUrl = (qrCode: string) => {
    return `${window.location.origin}/menu?table=${qrCode}`
  }

  const downloadQRCode = (table: Table) => {
    // Simple text-based QR code URL download
    const url = getQRUrl(table.qr_code)
    const blob = new Blob([`${table.table_name}\nQR: ${table.qr_code}\nURL: ${url}`], { type: "text/plain" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${table.table_name}_QR.txt`
    link.click()
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={mockUser} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Masa Yönetimi & QR Kodlar</h2>
            <p className="text-sm text-gray-600 mt-1">Masaları yönetin ve QR kodlarını oluşturun</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
            + Yeni Masa
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <Card key={table.id} className={!table.is_active ? "opacity-60" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{table.table_name}</span>
                  <Badge variant={table.is_active ? "default" : "secondary"}>
                    {table.is_active ? "Aktif" : "Pasif"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Masa No:</p>
                    <p className="font-semibold">{table.table_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Kapasite:</p>
                    <p className="font-semibold">{table.capacity} kişi</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Konum:</p>
                    <p className="font-semibold">{table.location}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">QR Kod:</p>
                    <p className="font-mono text-xs bg-gray-100 p-1 rounded">{table.qr_code}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => showQRCode(table)} className="flex-1">
                    📱 QR Göster
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleTableStatus(table)}
                    className={table.is_active ? "text-red-600" : "text-green-600"}
                  >
                    {table.is_active ? "Pasifleştir" : "Aktifleştir"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Table Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Masa Oluştur</DialogTitle>
              <DialogDescription>Yeni bir masa ekleyin ve otomatik QR kodu oluşturun.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTable}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="table_number">Masa Numarası *</Label>
                  <Input
                    id="table_number"
                    type="number"
                    value={formData.table_number}
                    onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="table_name">Masa Adı</Label>
                  <Input
                    id="table_name"
                    value={formData.table_name}
                    onChange={(e) => setFormData({ ...formData, table_name: e.target.value })}
                    placeholder={`Masa ${formData.table_number || ""}`}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Konum</Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="İç Mekan">İç Mekan</SelectItem>
                      <SelectItem value="Bahçe">Bahçe</SelectItem>
                      <SelectItem value="Balkon">Balkon</SelectItem>
                      <SelectItem value="Teras">Teras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="capacity">Kapasite</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Oluştur
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* QR Code Dialog */}
        {selectedTable && (
          <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedTable.table_name} - QR Kod</DialogTitle>
                <DialogDescription>Müşteriler bu QR kodu okutarak menüye erişebilir</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-gray-100 p-6 rounded-lg text-center">
                  <div className="bg-white p-4 inline-block rounded-lg mb-4">
                    <div className="text-6xl">📱</div>
                  </div>
                  <p className="font-mono text-sm bg-white p-2 rounded">{selectedTable.qr_code}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Menü URL:</p>
                  <div className="bg-gray-50 p-3 rounded text-sm break-all">{getQRUrl(selectedTable.qr_code)}</div>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>💡 Bu QR kodu veya URL'i kullanarak müşteriler:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Menüye erişebilir</li>
                    <li>Sipariş verebilir</li>
                    <li>Garson çağırabilir</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => downloadQRCode(selectedTable)}>
                  📥 Bilgileri İndir
                </Button>
                <Button onClick={() => setQrDialogOpen(false)}>Kapat</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
