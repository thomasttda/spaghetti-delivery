'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { Minus, Plus, ShoppingCart, X } from 'lucide-react'
import { BeverageUpsell } from './beverage-upsell'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  ingredients: string[]
  available: boolean
}

type Props = {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetail({ product, open, onOpenChange }: Props) {
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([])
  const [showIngredients, setShowIngredients] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [showUpsell, setShowUpsell] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const toggleIngredient = (ing: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        removed_ingredients: removedIngredients,
      })
    }

    // If product is NOT a beverage, show upsell
    if (product.category !== 'bebidas') {
      setShowUpsell(true)
    } else {
      onOpenChange(false)
      openCart()
    }

    // Reset
    setRemovedIngredients([])
    setQuantity(1)
    setShowIngredients(false)
  }

  const handleUpsellClose = () => {
    setShowUpsell(false)
    onOpenChange(false)
    openCart()
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl pb-8">
          <SheetHeader className="sr-only">
            <SheetTitle>{product.name}</SheetTitle>
            <SheetDescription>{product.description}</SheetDescription>
          </SheetHeader>

          {/* Product Image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary mb-4 -mx-2 -mt-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-card to-primary/5 flex items-center justify-center">
              <span className="text-6xl">
                {product.category === 'bebidas' ? '🥤' : product.category === 'sobremesas' ? '🍫' : '🍔'}
              </span>
            </div>
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold font-display">{product.name}</h2>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{product.description}</p>
            </div>

            <div className="text-3xl font-bold text-primary">
              {formatCurrency(product.price)}
            </div>

            {/* Remove Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIngredients(!showIngredients)}
                  className="mb-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover Ingredientes
                </Button>

                {showIngredients && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-secondary/50 animate-fade-in">
                    {product.ingredients.map((ing) => (
                      <label
                        key={ing}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={removedIngredients.includes(ing)}
                          onChange={() => toggleIngredient(ing)}
                          className="rounded border-border w-4 h-4 accent-primary"
                        />
                        <span
                          className={`text-sm transition-all ${
                            removedIngredients.includes(ing)
                              ? 'line-through text-muted-foreground'
                              : ''
                          }`}
                        >
                          {ing}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantidade:</span>
              <div className="flex items-center gap-3 bg-secondary rounded-full px-1 py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full text-base gap-2"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
              Adicionar ao Carrinho — {formatCurrency(product.price * quantity)}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <BeverageUpsell
        open={showUpsell}
        onClose={handleUpsellClose}
      />
    </>
  )
}
