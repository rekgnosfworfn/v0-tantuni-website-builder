"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type CustomizationOption = {
  id: string
  label: string
  price_adjustment: number
  is_default: boolean
  display_order: number
}

type Customization = {
  id: string
  name: string
  type: "checkbox" | "radio" | "select"
  is_required: boolean
  customization_options: CustomizationOption[]
}

type SelectedCustomization = {
  customization_id: string
  customization_name: string
  option_ids: string[]
  options: { id: string; label: string; price_adjustment: number }[]
}

export function ProductCustomizationDialog({
  open,
  onOpenChange,
  productId,
  productName,
  productPrice,
  onAddToCart,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  productPrice: number
  onAddToCart: (customizations: SelectedCustomization[], totalPrice: number) => void
}) {
  const [customizations, setCustomizations] = useState<Customization[]>([])
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (open && productId) {
      fetchCustomizations()
    }
  }, [open, productId])

  const fetchCustomizations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}/customizations`)
      if (response.ok) {
        const data = await response.json()
        setCustomizations(data.customizations || [])

        // Initialize with default selections
        const defaults = data.customizations.map((c: Customization) => {
          const defaultOptions = c.customization_options.filter((o) => o.is_default)
          return {
            customization_id: c.id,
            customization_name: c.name,
            option_ids: defaultOptions.map((o) => o.id),
            options: defaultOptions.map((o) => ({
              id: o.id,
              label: o.label,
              price_adjustment: o.price_adjustment,
            })),
          }
        })
        setSelectedCustomizations(defaults)
      }
    } catch (error) {
      console.error("Error fetching customizations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRadioChange = (customization: Customization, optionId: string) => {
    const option = customization.customization_options.find((o) => o.id === optionId)
    if (!option) return

    setSelectedCustomizations((prev) => {
      const existing = prev.find((s) => s.customization_id === customization.id)
      if (existing) {
        return prev.map((s) =>
          s.customization_id === customization.id
            ? {
                ...s,
                option_ids: [optionId],
                options: [{ id: option.id, label: option.label, price_adjustment: option.price_adjustment }],
              }
            : s,
        )
      }
      return [
        ...prev,
        {
          customization_id: customization.id,
          customization_name: customization.name,
          option_ids: [optionId],
          options: [{ id: option.id, label: option.label, price_adjustment: option.price_adjustment }],
        },
      ]
    })
  }

  const handleCheckboxChange = (customization: Customization, optionId: string, checked: boolean) => {
    const option = customization.customization_options.find((o) => o.id === optionId)
    if (!option) return

    setSelectedCustomizations((prev) => {
      const existing = prev.find((s) => s.customization_id === customization.id)
      if (existing) {
        if (checked) {
          return prev.map((s) =>
            s.customization_id === customization.id
              ? {
                  ...s,
                  option_ids: [...s.option_ids, optionId],
                  options: [
                    ...s.options,
                    { id: option.id, label: option.label, price_adjustment: option.price_adjustment },
                  ],
                }
              : s,
          )
        } else {
          return prev.map((s) =>
            s.customization_id === customization.id
              ? {
                  ...s,
                  option_ids: s.option_ids.filter((id) => id !== optionId),
                  options: s.options.filter((o) => o.id !== optionId),
                }
              : s,
          )
        }
      } else if (checked) {
        return [
          ...prev,
          {
            customization_id: customization.id,
            customization_name: customization.name,
            option_ids: [optionId],
            options: [{ id: option.id, label: option.label, price_adjustment: option.price_adjustment }],
          },
        ]
      }
      return prev
    })
  }

  const calculateTotalPrice = () => {
    const customizationPrice = selectedCustomizations.reduce((sum, sc) => {
      return sum + sc.options.reduce((optSum, opt) => optSum + opt.price_adjustment, 0)
    }, 0)
    return (productPrice + customizationPrice) * quantity
  }

  const canAddToCart = () => {
    // Check if all required customizations have selections
    return customizations.every((c) => {
      if (!c.is_required) return true
      const selected = selectedCustomizations.find((s) => s.customization_id === c.id)
      return selected && selected.option_ids.length > 0
    })
  }

  const handleAddToCart = () => {
    if (canAddToCart()) {
      const totalPrice = calculateTotalPrice()
      for (let i = 0; i < quantity; i++) {
        onAddToCart(selectedCustomizations, totalPrice / quantity)
      }
      onOpenChange(false)
      setQuantity(1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{productName}</DialogTitle>
          <p className="text-sm text-gray-600">Özelleştir ve sepete ekle</p>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Yükleniyor...</p>
          </div>
        ) : customizations.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-600">Bu ürün için özelleştirme seçeneği bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {customizations.map((customization) => (
              <div key={customization.id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">
                  {customization.name}
                  {customization.is_required && <span className="text-red-600 ml-1">*</span>}
                </h3>

                {customization.type === "radio" ? (
                  <RadioGroup
                    value={
                      selectedCustomizations.find((s) => s.customization_id === customization.id)?.option_ids[0] || ""
                    }
                    onValueChange={(value) => handleRadioChange(customization, value)}
                  >
                    <div className="space-y-2">
                      {customization.customization_options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            {option.label}
                            {option.price_adjustment !== 0 && (
                              <span className="ml-2 text-sm text-gray-600">
                                ({option.price_adjustment > 0 ? "+" : ""}
                                {option.price_adjustment.toFixed(2)} ₺)
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    {customization.customization_options.map((option) => {
                      const isChecked =
                        selectedCustomizations
                          .find((s) => s.customization_id === customization.id)
                          ?.option_ids.includes(option.id) || false
                      return (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.id}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleCheckboxChange(customization, option.id, !!checked)}
                          />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            {option.label}
                            {option.price_adjustment !== 0 && (
                              <span className="ml-2 text-sm text-gray-600">
                                ({option.price_adjustment > 0 ? "+" : ""}
                                {option.price_adjustment.toFixed(2)} ₺)
                              </span>
                            )}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Label>Adet:</Label>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                −
              </Button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <Button size="sm" variant="outline" onClick={() => setQuantity(quantity + 1)}>
                +
              </Button>
            </div>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Toplam</p>
              <p className="text-xl font-bold text-red-600">{calculateTotalPrice().toFixed(2)} ₺</p>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart() || loading}
              className="bg-red-600 hover:bg-red-700"
            >
              Sepete Ekle
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
