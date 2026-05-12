'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { DEMO_PRODUCTS } from '@/lib/demo-data'
import { formatCurrency } from '@/lib/utils'
import { GlassWater, X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
}

export function BeverageUpsell({ open, onClose }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const beverages = DEMO_PRODUCTS.filter((p) => p.category === 'bebidas').slice(0, 3)

  const handleAdd = (beverage: typeof beverages[0]) => {
    addItem({
      product_id: beverage.id,
      name: beverage.name,
      price: beverage.price,
      image_url: beverage.image_url,
      removed_ingredients: [],
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GlassWater className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-lg">
            Que tal uma bebida gelada? 🧊
          </DialogTitle>
          <DialogDescription className="text-center">
            Acompanhe seu pedido com uma bebida refrescante!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          {beverages.map((bev) => (
            <button
              key={bev.id}
              onClick={() => handleAdd(bev)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                <span className="text-2xl">🥤</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">{bev.name}</p>
                <p className="text-primary font-bold text-sm">{formatCurrency(bev.price)}</p>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                + Adicionar
              </span>
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          className="w-full mt-2"
          onClick={onClose}
        >
          <X className="h-4 w-4 mr-1" />
          Não, obrigado
        </Button>
      </DialogContent>
    </Dialog>
  )
}
