import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "33 Mersin Tantuni - Mersin'in En Lezzetli Tantunisi",
  description:
    "33 Mersin Tantuni - Geleneksel Mersin tantunisinin en lezzetli hali. Online sipariş verin, gel-al veya iç mekanda tadını çıkarın.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  )
}
