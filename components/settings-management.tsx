"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"

type Settings = Record<string, string>

export function SettingsManagement({ settings: initialSettings }: { settings: Settings }) {
  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) throw new Error("Failed to save settings")

      alert("Ayarlar başarıyla kaydedildi!")
      // Refresh the page to apply new settings
      window.location.reload()
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Ayarlar kaydedilirken bir hata oluştu.")
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-3xl font-bold">Site Ayarları</h2>

      <Card>
        <CardHeader>
          <CardTitle>Genel Bilgiler</CardTitle>
          <CardDescription>Site adı, logo ve hoş geldin mesajını düzenleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site_name">Site Adı</Label>
            <Input
              id="site_name"
              value={settings.site_name || ""}
              onChange={(e) => updateSetting("site_name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="welcome_text">Hoş Geldin Mesajı</Label>
            <Textarea
              id="welcome_text"
              value={settings.welcome_text || ""}
              onChange={(e) => updateSetting("welcome_text", e.target.value)}
              rows={3}
            />
          </div>

          <ImageUpload
            value={settings.site_logo || ""}
            onChange={(url) => updateSetting("site_logo", url)}
            label="Site Logosu"
            aspectRatio="square"
          />

          <ImageUpload
            value={settings.site_favicon || ""}
            onChange={(url) => updateSetting("site_favicon", url)}
            label="Site Favicon"
            aspectRatio="square"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tema Renkleri</CardTitle>
          <CardDescription>Site renklerini özelleştirin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primary_color">Ana Renk</Label>
            <div className="flex gap-3 items-center">
              <Input
                id="primary_color"
                type="color"
                value={settings.primary_color || "#DC2626"}
                onChange={(e) => updateSetting("primary_color", e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={settings.primary_color || "#DC2626"}
                onChange={(e) => updateSetting("primary_color", e.target.value)}
                placeholder="#DC2626"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondary_color">İkincil Renk</Label>
            <div className="flex gap-3 items-center">
              <Input
                id="secondary_color"
                type="color"
                value={settings.secondary_color || "#F59E0B"}
                onChange={(e) => updateSetting("secondary_color", e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={settings.secondary_color || "#F59E0B"}
                onChange={(e) => updateSetting("secondary_color", e.target.value)}
                placeholder="#F59E0B"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="w-full bg-red-600 hover:bg-red-700" size="lg">
        {isSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
      </Button>
    </div>
  )
}
