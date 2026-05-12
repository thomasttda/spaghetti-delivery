/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Edit, Trash2, ShoppingCart } from 'lucide-react'

type InventoryItem = {
  id: string
  item_name: string
  quantity: number
  min_quantity: number
  unit: string
}

export function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  
  const [form, setForm] = useState({
    item_name: '',
    quantity: '',
    min_quantity: '',
    unit: 'unidades'
  })

  const fetchInventory = async () => {
    const { data } = await supabase.from('inventory').select('*').order('item_name')
    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      item_name: form.item_name,
      quantity: parseFloat(form.quantity),
      min_quantity: parseFloat(form.min_quantity),
      unit: form.unit
    }

    if (editingItem) {
      const { error } = await supabase.from('inventory').update(payload as never).eq('id', editingItem.id)
      if (error) { alert(error.message); return }
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...payload } : i))
    } else {
      const { data, error } = await supabase.from('inventory').insert(payload as never).select().single()
      if (error) { alert(error.message); return }
      if (data) setItems([...items, data].sort((a, b) => a.item_name.localeCompare(b.item_name)))
    }
    
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este item do estoque?')) return
    await supabase.from('inventory').delete().eq('id', id)
    setItems(items.filter(i => i.id !== id))
  }

  const startEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setForm({
      item_name: item.item_name,
      quantity: item.quantity.toString(),
      min_quantity: item.min_quantity.toString(),
      unit: item.unit
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setForm({ item_name: '', quantity: '', min_quantity: '', unit: 'unidades' })
  }

  const shoppingList = items.filter(i => i.quantity <= i.min_quantity)

  if (loading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>

  return (
    <div className="space-y-6">
      {/* Shopping List Alert */}
      {shoppingList.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-500 font-bold">
            <ShoppingCart className="h-5 w-5" />
            <h3>Lista de Compras (Estoque Baixo)</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {shoppingList.map(item => (
              <div key={item.id} className="bg-background rounded-lg p-3 border border-amber-500/20 shadow-sm flex flex-col">
                <span className="font-medium text-sm">{item.item_name}</span>
                <span className="text-xs text-muted-foreground mt-1">Atual: {item.quantity} {item.unit}</span>
                <span className="text-xs text-red-500">Mínimo: {item.min_quantity} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Management */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Controle de Estoque</h3>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-1"/> Novo Item
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 bg-secondary/50 rounded-lg space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome do Item</label>
                <Input required value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} placeholder="Ex: Pão Brioche" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Quantidade Atual</label>
                <Input type="number" step="0.01" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Estoque Mínimo</label>
                <Input type="number" step="0.01" required value={form.min_quantity} onChange={e => setForm({...form, min_quantity: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Unidade de Medida</label>
                <select 
                  value={form.unit} 
                  onChange={e => setForm({...form, unit: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="unidades">Unidades</option>
                  <option value="kg">Quilos (Kg)</option>
                  <option value="g">Gramas (g)</option>
                  <option value="litros">Litros (L)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="pacotes">Pacotes</option>
                  <option value="caixas">Caixas</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit">Salvar Item</Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-3 rounded-tl-lg">Item</th>
                <th className="p-3 text-center">Quantidade Atual</th>
                <th className="p-3 text-center">Mínimo</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 rounded-tr-lg text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Estoque vazio</td></tr>
              )}
              {items.map(item => {
                const isLow = item.quantity <= item.min_quantity
                return (
                  <tr key={item.id} className="border-b border-border/50">
                    <td className="p-3 font-medium">{item.item_name}</td>
                    <td className="p-3 text-center">{item.quantity} {item.unit}</td>
                    <td className="p-3 text-center text-muted-foreground">{item.min_quantity} {item.unit}</td>
                    <td className="p-3 text-center">
                      {isLow ? (
                        <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">Estoque Baixo</Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Regular</Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
