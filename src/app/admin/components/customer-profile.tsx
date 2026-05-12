/* eslint-disable */
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Package, User, MapPin, Phone, Mail, Save, Loader2 } from 'lucide-react'

type Customer = {
  id: string
  email: string
  full_name: string
  phone: string
  address?: string
  total_spent: number
  order_count: number
  created_at: string
}

type Order = any

type Props = {
  customer: Customer | null
  orders: Order[]
  open: boolean
  onClose: () => void
  onUpdate: (updated: Customer) => void
}

export function CustomerProfileModal({ customer, orders, open, onClose, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: customer?.full_name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
  })

  // Update form when customer changes
  useState(() => {
    if (customer) {
      setForm({
        full_name: customer.full_name || '',
        phone: customer.phone || '',
        address: customer.address || '',
      })
    }
  })

  if (!customer) return null

  // Filter orders for this customer based on ID or email
  const customerOrders = orders.filter(
    o => o.user_id === customer.id || o.customer_email === customer.email
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
      } as never)
      .eq('id', customer.id)
      
    if (error) {
      alert('Erro ao atualizar: ' + error.message)
    } else {
      onUpdate({ ...customer, ...form })
      onClose()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b border-border/50 bg-secondary/30">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6 text-primary" />
            Perfil do Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm text-center">
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">Pedidos</p>
              <p className="text-2xl font-bold">{customer.order_count}</p>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm text-center">
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">Total Gasto</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(customer.total_spent)}</p>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm text-center">
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1">Ticket Médio</p>
              <p className="text-2xl font-bold">
                {customer.order_count ? formatCurrency(customer.total_spent / customer.order_count) : 'R$ 0,00'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-lg">
                <EditIcon className="h-5 w-5 text-primary" />
                Dados Pessoais
              </h3>
              <form id="customer-form" onSubmit={handleSubmit} className="space-y-4 bg-secondary/20 p-4 rounded-xl border border-border/50">
                <div>
                  <label className="text-sm font-medium mb-1 flex items-center gap-2">
                    <User className="h-4 w-4" /> Nome Completo
                  </label>
                  <Input 
                    value={form.full_name} 
                    onChange={e => setForm({...form, full_name: e.target.value})} 
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> E-mail (Acesso)
                  </label>
                  <Input value={customer.email} disabled className="bg-muted" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Telefone
                  </label>
                  <Input 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Endereço Padrão
                  </label>
                  <Input 
                    value={form.address} 
                    onChange={e => setForm({...form, address: e.target.value})} 
                    placeholder="Endereço para entregas"
                  />
                </div>
              </form>
            </div>

            {/* Order History */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                Histórico de Pedidos
              </h3>
              <div className="space-y-3 pr-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {customerOrders.length === 0 ? (
                  <div className="text-center p-6 border border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground text-sm">Nenhum pedido localizado</p>
                  </div>
                ) : (
                  customerOrders.map(order => (
                    <div key={order.id} className="bg-card border border-border p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm">#{order.order_number}</span>
                        <Badge variant="outline">{formatDate(new Date(order.created_at)).split(' ')[0]}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {order.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')}
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className={
                          order.status === 'delivered' ? 'text-emerald-500' : 'text-amber-500'
                        }>
                          {order.status === 'delivered' ? 'Concluído' : 'Em andamento'}
                        </span>
                        <span className="text-primary">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card flex justify-end gap-2 rounded-b-lg">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="customer-form" disabled={loading} className="min-w-[120px]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Salvar</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}
