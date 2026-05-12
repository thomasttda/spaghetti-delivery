'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { formatCurrency } from '@/lib/utils'

export function CartButton() {
  const { openCart, totalItems, subtotal } = useCartStore()
  const count = totalItems()

  if (count === 0) return null

  return (
    <button
      onClick={openCart}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-6 py-3.5 rounded-full bg-primary text-primary-foreground shadow-2xl hover:brightness-110 transition-all duration-300 animate-slide-up cursor-pointer group"
      style={{
        boxShadow: '0 8px 32px rgba(212, 175, 55, 0.4)',
      }}
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5 group-hover:animate-bounce-subtle" />
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger text-white text-xs flex items-center justify-center font-bold">
          {count}
        </span>
      </div>
      <span className="font-bold">Ver Carrinho</span>
      <span className="text-sm opacity-80">•</span>
      <span className="font-bold">{formatCurrency(subtotal())}</span>
    </button>
  )
}
