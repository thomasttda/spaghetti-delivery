/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Edit, Trash2, MapPin } from 'lucide-react'

type DeliveryZone = {
  id: string
  neighborhood: string
  fee: number
  active: boolean
}

export function DeliveryTab() {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  
  const [form, setForm] = useState({
    neighborhood: '',
    fee: '',
    active: true
  })

  const fetchZones = async () => {
    const { data } = await supabase.from('delivery_zones').select('*').order('neighborhood')
    if (data) setZones(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchZones()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      neighborhood: form.neighborhood,
      fee: parseFloat(form.fee),
      active: form.active
    }

    if (editingZone) {
      const { error } = await supabase.from('delivery_zones').update(payload as never).eq('id', editingZone.id)
      if (error) { alert(error.message); return }
      setZones(zones.map(z => z.id === editingZone.id ? { ...z, ...payload } : z))
    } else {
      const { data, error } = await supabase.from('delivery_zones').insert(payload as never).select().single()
      if (error) { alert(error.message); return }
      if (data) setZones([...zones, data].sort((a, b) => a.neighborhood.localeCompare(b.neighborhood)))
    }
    
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta zona de entrega?')) return
    await supabase.from('delivery_zones').delete().eq('id', id)
    setZones(zones.filter(z => z.id !== id))
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('delivery_zones').update({ active: !current } as never).eq('id', id)
    if (!error) {
      setZones(zones.map(z => z.id === id ? { ...z, active: !current } : z))
    }
  }

  const startEdit = (zone: DeliveryZone) => {
    setEditingZone(zone)
    setForm({
      neighborhood: zone.neighborhood,
      fee: zone.fee.toString(),
      active: zone.active
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingZone(null)
    setForm({ neighborhood: '', fee: '', active: true })
  }

  if (loading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Zonas de Entrega
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Configure os bairros atendidos e suas respectivas taxas de entrega.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-1"/> Novo Bairro
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 bg-secondary/50 rounded-lg space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Nome do Bairro</label>
                <Input required value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} placeholder="Ex: Vila Mariana" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Taxa (R$)</label>
                <Input type="number" step="0.01" required value={form.fee} onChange={e => setForm({...form, fee: e.target.value})} placeholder="0.00" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(c) => setForm({...form, active: c})} />
              <span className="text-sm">Bairro Ativo (Disponível para entrega)</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit">Salvar Bairro</Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50">
              <tr>
                <th className="p-3 rounded-tl-lg">Bairro</th>
                <th className="p-3 text-center">Taxa de Entrega</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 rounded-tr-lg text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {zones.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Nenhuma zona de entrega configurada</td></tr>
              )}
              {zones.map(zone => (
                <tr key={zone.id} className="border-b border-border/50">
                  <td className="p-3 font-medium">{zone.neighborhood}</td>
                  <td className="p-3 text-center font-bold text-primary">{formatCurrency(zone.fee)}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch checked={zone.active} onCheckedChange={() => toggleActive(zone.id, zone.active)} />
                      {zone.active ? (
                        <span className="text-emerald-500 text-xs font-medium">Ativo</span>
                      ) : (
                        <span className="text-muted-foreground text-xs font-medium">Inativo</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(zone)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(zone.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
