'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { DEMO_PRODUCTS } from '@/lib/demo-data'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { GlassWater, X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
}

type Beverage = {
  id: string
  name: string
  price: number
  image_url: string
}

export function BeverageUpsell({ open, onClose }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [beverages, setBeverages] = useState<Beverage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setIsLoading(true)
      supabase
        .from('products')
        .select('*')
        .eq('category', 'bebidas')
        .eq('available', true)
        .limit(3)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setBeverages(data)
          } else {
            setBeverages(DEMO_PRODUCTS.filter((p) => p.category === 'bebidas').slice(0, 3) as unknown as Beverage[])
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [open])

  const handleAdd = (beverage: Beverage) => {
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
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : beverages.length > 0 ? (
            beverages.map((bev) => (
              <button
                key={bev.id}
                onClick={() => handleAdd(bev)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  <img src={bev.image_url} alt={bev.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <span className="text-2xl relative z-10">🥤</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{bev.name}</p>
                  <p className="text-primary font-bold text-sm">{formatCurrency(bev.price)}</p>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  + Adicionar
                </span>
              </button>
            ))
          ) : (
            <p className="text-sm text-center text-muted-foreground py-4">
              Nenhuma bebida disponível no momento.
            </p>
          )}
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
