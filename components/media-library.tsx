"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/image-upload"
import { Copy, Check } from "lucide-react"
import Image from "next/image"

type MediaFile = {
  url: string
  pathname: string
  size: number
  uploadedAt: Date
}

export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadedUrl, setUploadedUrl] = useState("")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/media")
      if (!response.ok) throw new Error("Failed to fetch files")
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = (url: string) => {
    setUploadedUrl("")
    fetchFiles()
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Medya Kütüphanesi</h2>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Görsel Yükle</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={uploadedUrl}
            onChange={handleUpload}
            label="Görsel yüklemek için tıklayın veya sürükleyin"
            aspectRatio="landscape"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yüklenen Görseller ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-600 py-8">Yükleniyor...</p>
          ) : files.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Henüz yüklenmiş görsel bulunmuyor</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <Card key={file.url} className="overflow-hidden">
                  <div className="relative aspect-square bg-gray-200">
                    <Image src={file.url || "/placeholder.svg"} alt={file.pathname} fill className="object-cover" />
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-gray-600 truncate mb-2">{file.pathname}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => copyToClipboard(file.url)}
                    >
                      {copiedUrl === file.url ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Kopyalandı
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          URL Kopyala
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
