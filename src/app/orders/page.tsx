'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/supabase'
import { Header } from '@/components/header'
import { ArrowLeft, Package, Clock } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type Order = {
  id: string
  order_number: string
  status: OrderStatus
  total: number
  created_at: string
  items: { name: string; quantity: number; price: number; removed_ingredients: string[] }[]
}

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  preparing: 'default',
  ready: 'success',
  out_for_delivery: 'secondary',
  delivered: 'success',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data)
      setLoading(false)
    }
    fetchOrders()

    // Real-time updates for order status changes
    const channel = supabase
      .channel('my-orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } as Order : o))
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Menu
        </Link>

        <h1 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Meus Pedidos
        </h1>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
            <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Faça seu primeiro pedido!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-4 card-premium">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold text-lg">#{order.order_number}</span>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(order.created_at))}
                    </p>
                  </div>
                  <Badge variant={statusVariant[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </div>

                <div className="space-y-1.5 border-t border-border pt-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                        {item.removed_ingredients?.length > 0 && (
                          <span className="text-muted-foreground text-xs ml-1">
                            (sem {item.removed_ingredients.join(', ')})
                          </span>
                        )}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
