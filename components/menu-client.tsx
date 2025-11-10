"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import { ProductCustomizationDialog } from "@/components/product-customization-dialog"

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string
}

type Category = {
  id: string
  name: string
  slug: string
  products: Product[]
}

type SelectedCustomization = {
  customization_id: string
  customization_name: string
  option_ids: string[]
  options: { id: string; label: string; price_adjustment: number }[]
}

type CartItem = Product & {
  quantity: number
  customizations?: SelectedCustomization[]
  customized_price?: number
  cart_id?: string // Unique ID for cart items with different customizations
}

export function MenuClient({ categories }: { categories: Category[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [customizationDialog, setCustomizationDialog] = useState<{
    open: boolean
    product: Product | null
  }>({ open: false, product: null })
  const router = useRouter()

  const openCustomizationDialog = async (product: Product) => {
    // Check if product has customizations
    try {
      const response = await fetch(`/api/products/${product.id}/customizations`)
      if (response.ok) {
        const data = await response.json()
        if (data.customizations && data.customizations.length > 0) {
          // Product has customizations, open dialog
          setCustomizationDialog({ open: true, product })
        } else {
          // No customizations, add directly to cart
          addToCart(product, [], product.price)
        }
      } else {
        // Error or no customizations, add directly to cart
        addToCart(product, [], product.price)
      }
    } catch (error) {
      console.error("Error checking customizations:", error)
      // Fallback: add directly to cart
      addToCart(product, [], product.price)
    }
  }

  const addToCart = (product: Product, customizations: SelectedCustomization[], customized_price: number) => {
    setCart((prev) => {
      // Create unique cart ID based on product and customizations
      const cartId = `${product.id}-${JSON.stringify(customizations.map((c) => c.option_ids).sort())}`

      const existing = prev.find((item) => item.cart_id === cartId)
      if (existing) {
        return prev.map((item) => (item.cart_id === cartId ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          customizations: customizations.length > 0 ? customizations : undefined,
          customized_price: customizations.length > 0 ? customized_price : undefined,
          cart_id: cartId,
        },
      ]
    })
  }

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cart_id === cartId) {
            const newQuantity = item.quantity + delta
            return { ...item, quantity: Math.max(0, newQuantity) }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cart_id !== cartId))
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.customized_price || item.price
      return sum + itemPrice * item.quantity
    }, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const handleCheckout = () => {
    // Store cart in sessionStorage and navigate to checkout
    sessionStorage.setItem("cart", JSON.stringify(cart))
    router.push("/checkout")
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Categories and Products */}
        <div className="space-y-12">
          {categories.map((category) => (
            <section key={category.id} id={category.slug}>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <div className="relative w-full h-48 bg-gray-200">
                        <Image
                          src={
                            product.image_url ||
                            `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(product.name) || "/placeholder.svg"}`
                          }
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                      {product.description && <p className="text-sm text-gray-600 mb-3">{product.description}</p>}
                      <p className="text-2xl font-bold text-red-600">{product.price.toFixed(2)} ₺</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        onClick={() => openCustomizationDialog(product)}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        + Sepete Ekle
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Customization Dialog */}
      {customizationDialog.product && (
        <ProductCustomizationDialog
          open={customizationDialog.open}
          onOpenChange={(open) => setCustomizationDialog({ open, product: open ? customizationDialog.product : null })}
          productId={customizationDialog.product.id}
          productName={customizationDialog.product.name}
          productPrice={customizationDialog.product.price}
          onAddToCart={(customizations, totalPrice) => {
            if (customizationDialog.product) {
              addToCart(customizationDialog.product, customizations, totalPrice)
            }
          }}
        />
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg bg-red-600 hover:bg-red-700"
            >
              <span className="text-2xl">🛒</span>
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500">{getTotalItems()}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Sepetim</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full py-6">
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {cart.map((item) => (
                  <Card key={item.cart_id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0 bg-gray-200 rounded">
                          <Image
                            src={
                              item.image_url ||
                              `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(item.name) || "/placeholder.svg"}`
                            }
                            alt={item.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>

                          {/* Show customizations if any */}
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {item.customizations.map((customization) =>
                                customization.options.map((option) => (
                                  <p key={option.id} className="text-xs text-gray-600">
                                    • {option.label}
                                    {option.price_adjustment !== 0 && (
                                      <span className="ml-1">
                                        ({option.price_adjustment > 0 ? "+" : ""}
                                        {option.price_adjustment.toFixed(2)} ₺)
                                      </span>
                                    )}
                                  </p>
                                )),
                              )}
                            </div>
                          )}

                          <p className="text-sm text-gray-600 mt-1">
                            {(item.customized_price || item.price).toFixed(2)} ₺
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.cart_id || item.id, -1)}
                            >
                              −
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.cart_id || item.id, 1)}
                            >
                              +
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.cart_id || item.id)}
                              className="ml-auto text-red-600"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam:</span>
                  <span className="text-red-600">{getTotalPrice().toFixed(2)} ₺</span>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-red-600 hover:bg-red-700" size="lg">
                  Siparişi Tamamla
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
