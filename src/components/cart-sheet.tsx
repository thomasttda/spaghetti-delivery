'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Checkout } from './checkout'

export function CartSheet() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore()
  const [showCheckout, setShowCheckout] = useState(false)

  const total = subtotal()

  if (showCheckout) {
    return (
      <Checkout
        open={showCheckout}
        onClose={() => {
          setShowCheckout(false)
          closeCart()
        }}
        onBack={() => setShowCheckout(false)}
      />
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent side="right" className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Seu Carrinho
          </SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? 'Seu carrinho está vazio'
              : `${items.length} ${items.length === 1 ? 'item' : 'itens'} no carrinho`}
          </SheetDescription>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <ShoppingBag className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Carrinho vazio</p>
              <p className="text-sm">Adicione itens para começar!</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.product_id}-${idx}`}
                className="flex gap-3 p-3 rounded-xl bg-secondary/50 animate-fade-in"
              >
                <div className="w-16 h-16 rounded-lg bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center">
                  <span className="text-2xl">🍔</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                  {item.removed_ingredients.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sem: {item.removed_ingredients.join(', ')}
                    </p>
                  )}
                  <p className="text-primary font-bold text-sm mt-1">
                    {formatCurrency(item.price * item.quantity)}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-card rounded-full px-1 py-0.5 border border-border">
                      <button
                        className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-lg">{formatCurrency(total)}</span>
            </div>
            <Button
              size="lg"
              className="w-full text-base"
              onClick={() => setShowCheckout(true)}
            >
              Finalizar Pedido
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
