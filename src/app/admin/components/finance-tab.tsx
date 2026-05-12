/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Order = any // Passed from props
type CashFlow = {
  id: string
  type: 'in' | 'out'
  amount: number
  description: string
  created_at: string
}

type Props = {
  orders: Order[]
}

export function FinanceTab({ orders }: Props) {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'in' as 'in' | 'out', amount: '', description: '' })

  const fetchCashFlows = async () => {
    const { data } = await supabase.from('cash_flow').select('*').order('created_at', { ascending: false })
    if (data) setCashFlows(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCashFlows()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || !form.description) return
    const { data, error } = await supabase.from('cash_flow').insert({
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description
    } as never).select().single()
    
    if (error) { alert(error.message); return }
    if (data) setCashFlows([data, ...cashFlows])
    setShowForm(false)
    setForm({ type: 'in', amount: '', description: '' })
  }

  // --- Calculate Chart Data (Sales Last 7 Days) ---
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toISOString().split('T')[0],
      display: `${d.getDate()}/${d.getMonth()+1}`,
      total: 0
    }
  })

  orders.forEach(order => {
    if (order.status === 'delivered') { // Only count delivered orders
      const orderDate = new Date(order.created_at).toISOString().split('T')[0]
      const day = last7Days.find(d => d.date === orderDate)
      if (day) day.total += order.total
    }
  })

  // --- Calculate Top Products ---
  const productCount: Record<string, number> = {}
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      productCount[item.name] = (productCount[item.name] || 0) + item.quantity
    })
  })
  const topProducts = Object.entries(productCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // --- Calculate Cash Flow Balance ---
  const cashIn = cashFlows.filter(c => c.type === 'in').reduce((acc, curr) => acc + curr.amount, 0)
  const cashOut = cashFlows.filter(c => c.type === 'out').reduce((acc, curr) => acc + curr.amount, 0)
  const balance = cashIn - cashOut

  if (loading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="text-muted-foreground text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500"/> Entradas Totais</div>
          <div className="text-2xl font-bold text-emerald-500">{formatCurrency(cashIn)}</div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="text-muted-foreground text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500"/> Saídas Totais</div>
          <div className="text-2xl font-bold text-red-500">{formatCurrency(cashOut)}</div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="text-muted-foreground text-sm flex items-center gap-2"><ArrowRightLeft className="h-4 w-4 text-primary"/> Saldo Atual</div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(balance)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4">
          <h3 className="font-bold">Vendas (Últimos 7 dias)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="display" stroke="#888" />
                <YAxis stroke="#888" tickFormatter={(v) => `R$${v}`} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Line type="monotone" dataKey="total" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4">
          <h3 className="font-bold">Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum dado de venda.</p>
            ) : (
              topProducts.map(([name, count], idx) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {idx + 1}
                    </div>
                    <span className="font-medium">{name}</span>
                  </div>
                  <Badge variant="secondary">{count} un</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cash Flow */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Fluxo de Caixa</h3>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-1"/> Nova Movimentação
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 bg-secondary/50 rounded-lg space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Tipo</label>
                <select 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value as 'in'|'out'})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="in">Entrada (+)</option>
                  <option value="out">Saída (-)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Valor (R$)</label>
                <Input type="number" step="0.01" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Descrição</label>
                <Input required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ex: Pagamento Fornecedor" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-3 rounded-tl-lg">Data</th>
                <th className="p-3">Descrição</th>
                <th className="p-3 rounded-tr-lg text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {cashFlows.length === 0 && (
                <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">Nenhuma movimentação</td></tr>
              )}
              {cashFlows.map(cf => (
                <tr key={cf.id} className="border-b border-border/50">
                  <td className="p-3">{formatDate(new Date(cf.created_at))}</td>
                  <td className="p-3">{cf.description}</td>
                  <td className="p-3 text-right">
                    <Badge variant="outline" className={cf.type === 'in' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-red-500 border-red-500/30 bg-red-500/10'}>
                      {cf.type === 'in' ? '+' : '-'} {formatCurrency(cf.amount)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
