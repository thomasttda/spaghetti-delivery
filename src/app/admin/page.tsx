'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShieldCheck,
  Package,
  UtensilsCrossed,
  Users,
  Bell,
  ArrowLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  LogOut,
  Loader2,
  Volume2,
  VolumeX,
  ImagePlus,
  MonitorPlay,
  DollarSign,
  ClipboardList,
  MapPin,
} from 'lucide-react'

import { FinanceTab } from './components/finance-tab'
import { InventoryTab } from './components/inventory-tab'
import { DeliveryTab } from './components/delivery-tab'
import { CustomerProfileModal } from './components/customer-profile'

type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string
  items: { name: string; quantity: number; price: number; removed_ingredients: string[] }[]
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  status: OrderStatus
  created_at: string
}

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

type Banner = {
  id: string
  image_url: string
  title: string
  active: boolean
  order: number
  product_id?: string | null
  created_at: string
}

const STATUS_FLOW: OrderStatus[] = ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered']

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  preparing: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  ready: 'bg-green-500/20 text-green-500 border-green-500/30',
  out_for_delivery: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'banners' | 'customers' | 'finance' | 'inventory' | 'delivery'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Product form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'hamburgueres',
    ingredients: '',
    image_url: '',
    available: true,
  })

  // Banner form state
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [bannerForm, setBannerForm] = useState({
    title: '',
    image_url: '',
    active: true,
    order: '0',
    product_id: '',
  })

  // Customer Profile state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  // Image Picker Helper
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        callback(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Check admin auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setCheckingAuth(false)
        return
      }

      const result = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (result.error) {
        console.warn('[Admin] Profile query error:', result.error.message)
        // Fallback: check by known admin email
        if (user.email === 'admin@spaghetti.com') {
          setIsAdmin(true)
        }
        setCheckingAuth(false)
        return
      }

      const profile = result.data as { role: string } | null
      if (profile?.role === 'admin') {
        setIsAdmin(true)
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  // Create audio for new order alert
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    audioRef.current = null
  }, [])

  const playAlert = useCallback(() => {
    if (!soundEnabled) return
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      oscillator.start()
      setTimeout(() => {
        oscillator.stop()
        audioCtx.close()
      }, 300)
      // Second beep
      setTimeout(() => {
        const audioCtx2 = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const osc2 = audioCtx2.createOscillator()
        const gain2 = audioCtx2.createGain()
        osc2.connect(gain2)
        gain2.connect(audioCtx2.destination)
        osc2.frequency.value = 1000
        osc2.type = 'sine'
        gain2.gain.value = 0.3
        osc2.start()
        setTimeout(() => {
          osc2.stop()
          audioCtx2.close()
        }, 300)
      }, 350)
    } catch {
      // Audio not supported
    }
  }, [soundEnabled])

  // Fetch data
  useEffect(() => {
    if (!isAdmin) return

    const fetchData = async () => {
      const [ordersRes, productsRes, customersRes, bannersRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('name'),
        supabase.from('profiles').select('*').eq('role', 'customer').order('total_spent', { ascending: false }),
        supabase.from('banners').select('*').order('order'),
      ])

      if (ordersRes.data) setOrders(ordersRes.data)
      if (productsRes.data) setProducts(productsRes.data)
      if (customersRes.data) setCustomers(customersRes.data)
      if (bannersRes.data) setBanners(bannersRes.data)
      setLoading(false)
    }

    fetchData()

    // Real-time orders
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => [payload.new as Order, ...prev])
          setNewOrderAlert(true)
          playAlert()
          setTimeout(() => setNewOrderAlert(false), 5000)
        }
      )
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
  }, [isAdmin, playAlert])

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    await supabase.from('orders').update({ status: newStatus } as never).eq('id', orderId)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
  }

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = STATUS_FLOW.indexOf(current)
    if (idx < STATUS_FLOW.length - 1) return STATUS_FLOW[idx + 1]
    return null
  }

  // Product CRUD
  const handleSaveProduct = async () => {
    const data = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      ingredients: productForm.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
      image_url: productForm.image_url || '/products/default.jpg',
      available: productForm.available,
    }

    if (editingProduct) {
      const { error } = await supabase.from('products').update(data as never).eq('id', editingProduct.id)
      if (error) { alert('Erro ao atualizar produto: ' + error.message); return; }
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data } : p)))
    } else {
      const { data: newProduct, error } = await supabase.from('products').insert(data as never).select().single()
      if (error) { alert('Erro ao criar produto: ' + error.message); return; }
      if (newProduct) setProducts((prev) => [...prev, newProduct])
    }
    resetProductForm()
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { alert('Erro ao excluir: ' + error.message); return; }
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const resetProductForm = () => {
    setEditingProduct(null)
    setShowProductForm(false)
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'hamburgueres',
      ingredients: '',
      image_url: '',
      available: true,
    })
  }

  const startEditProduct = (p: Product) => {
    setEditingProduct(p)
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      category: p.category,
      ingredients: p.ingredients.join(', '),
      image_url: p.image_url,
      available: p.available,
    })
    setShowProductForm(true)
  }

  // Banner CRUD
  const handleSaveBanner = async () => {
    const data = {
      title: bannerForm.title,
      image_url: bannerForm.image_url,
      active: bannerForm.active,
      order: parseInt(bannerForm.order) || 0,
      product_id: bannerForm.product_id || null,
    }

    if (editingBanner) {
      const { error } = await supabase.from('banners').update(data as never).eq('id', editingBanner.id)
      if (error) { alert('Erro ao atualizar banner: ' + error.message); return; }
      setBanners((prev) => prev.map((b) => (b.id === editingBanner.id ? { ...b, ...data } : b)))
    } else {
      const { data: newBanner, error } = await supabase.from('banners').insert(data as never).select().single()
      if (error) { alert('Erro ao criar banner: ' + error.message); return; }
      if (newBanner) setBanners((prev) => [...prev, newBanner])
    }
    resetBannerForm()
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) { alert('Erro ao excluir: ' + error.message); return; }
    setBanners((prev) => prev.filter((b) => b.id !== id))
  }

  const resetBannerForm = () => {
    setEditingBanner(null)
    setShowBannerForm(false)
    setBannerForm({ title: '', image_url: '', active: true, order: '0', product_id: '' })
  }

  const startEditBanner = (b: Banner) => {
    setEditingBanner(b)
    setBannerForm({
      title: b.title,
      image_url: b.image_url,
      active: b.active,
      order: b.order.toString(),
      product_id: b.product_id || '',
    })
    setShowBannerForm(true)
  }

  // Auth check screens
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-card border border-border rounded-2xl p-8 max-w-md">
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-danger/50" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">
            Esta área é exclusiva para administradores. Faça login com uma conta de administrador.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            </Link>
            <Link href="/login">
              <Button>Fazer Login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image src="/logo_spaghetti.png" alt="Spaghetti Expresso" fill className="object-contain" />
              </div>
            </Link>
            <div>
              <h1 className="font-bold font-display flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Painel Admin
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Order Alert */}
            {newOrderAlert && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 text-success text-sm font-semibold animate-pulse-gold">
                <Bell className="h-4 w-4" />
                Novo Pedido!
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-full"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
              className="rounded-full"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-1 bg-secondary/50 p-1 rounded-xl mb-6">
          {[
            { key: 'orders' as const, label: 'Pedidos', icon: Package },
            { key: 'menu' as const, label: 'Cardápio', icon: UtensilsCrossed },
            { key: 'banners' as const, label: 'Banners', icon: MonitorPlay },
            { key: 'customers' as const, label: 'Clientes', icon: Users },
            { key: 'finance' as const, label: 'Financeiro', icon: DollarSign },
            { key: 'inventory' as const, label: 'Estoque', icon: ClipboardList },
            { key: 'delivery' as const, label: 'Entregas', icon: MapPin },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === key
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <>
            {/* ===== ORDERS TAB ===== */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Nenhum pedido ainda</p>
                    <p className="text-sm">Novos pedidos aparecerão aqui em tempo real</p>
                  </div>
                ) : (
                  orders.map((order) => {
                    const nextStatus = getNextStatus(order.status)
                    return (
                      <div
                        key={order.id}
                        className="bg-card border border-border rounded-2xl p-4 sm:p-6 card-premium animate-fade-in"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold">#{order.order_number}</span>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                                {ORDER_STATUS_LABELS[order.status]}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(new Date(order.created_at))}
                            </p>
                          </div>

                          {nextStatus && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                              className="gap-1"
                            >
                              {ORDER_STATUS_LABELS[nextStatus]}
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-4 p-3 rounded-lg bg-secondary/30">
                          <div><span className="text-muted-foreground">Nome:</span> {order.customer_name}</div>
                          <div><span className="text-muted-foreground">Tel:</span> {order.customer_phone}</div>
                          <div><span className="text-muted-foreground">End:</span> {order.customer_address}</div>
                        </div>

                        {/* Items */}
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <div>
                                <span>{item.quantity}x {item.name}</span>
                                {item.removed_ingredients?.length > 0 && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    (sem {item.removed_ingredients.join(', ')})
                                  </span>
                                )}
                              </div>
                              <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                          <span className="text-sm text-muted-foreground">
                            Entrega: {formatCurrency(order.delivery_fee)}
                          </span>
                          <span className="font-bold text-lg text-primary">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* ===== MENU TAB ===== */}
            {activeTab === 'menu' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold font-display">Gestão do Cardápio</h2>
                  <Button
                    onClick={() => {
                      resetProductForm()
                      setShowProductForm(true)
                    }}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" /> Novo Produto
                  </Button>
                </div>

                {/* Product Form */}
                {showProductForm && (
                  <div className="bg-card border border-border rounded-2xl p-6 mb-6 animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">
                      {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Nome</label>
                        <Input
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="Nome do produto"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Preço (R$)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-sm font-medium">Descrição</label>
                        <Input
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          placeholder="Descrição do produto"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Categoria</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="hamburgueres">Hambúrgueres</option>
                          <option value="combos">Combos</option>
                          <option value="bebidas">Bebidas</option>
                          <option value="sobremesas">Sobremesas</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Imagem do Produto (PNG/JPG/GIF)</label>
                        <div className="flex gap-2">
                          <Input
                            value={productForm.image_url}
                            onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                            placeholder="URL ou selecione um arquivo..."
                          />
                          <Button type="button" variant="outline" className="shrink-0 relative overflow-hidden" aria-label="Escolher Imagem">
                            <ImagePlus className="h-4 w-4" />
                            <input 
                              type="file" 
                              accept="image/png, image/jpeg, image/gif" 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleImagePick(e, (base64) => setProductForm({ ...productForm, image_url: base64 }))} 
                            />
                          </Button>
                        </div>
                        {productForm.image_url && productForm.image_url.startsWith('data:image') && (
                          <div className="mt-2 text-xs text-success font-medium">✔ Imagem local carregada pronta para salvar</div>
                        )}
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-sm font-medium">Ingredientes (separados por vírgula)</label>
                        <Input
                          value={productForm.ingredients}
                          onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                          placeholder="Pão, Carne, Queijo, ..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={productForm.available}
                          onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                          className="w-4 h-4 accent-primary"
                        />
                        <label className="text-sm font-medium">Disponível</label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" onClick={resetProductForm}>Cancelar</Button>
                      <Button onClick={handleSaveProduct}>
                        {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Products List */}
                <div className="space-y-3">
                  {products.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Nenhum produto cadastrado</p>
                      <Button onClick={async () => {
                        const { DEMO_PRODUCTS } = await import('@/lib/demo-data');
                        for (const p of DEMO_PRODUCTS) {
                          await supabase.from('products').insert({
                            name: p.name, description: p.description, price: p.price,
                            category: p.category, image_url: p.image_url, ingredients: p.ingredients, available: p.available
                          } as never);
                        }
                        window.location.reload();
                      }} className="mt-4" variant="outline">
                        Importar Dados Demo
                      </Button>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-lg bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center mt-1">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-base truncate">{product.name}</h3>
                              {!product.available && (
                                <Badge variant="danger">Indisponível</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                            <p className="text-sm font-bold text-primary mt-1">{formatCurrency(product.price)}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditProduct(product)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" /> Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-danger hover:text-danger hover:bg-danger/10 gap-2"
                          >
                            <Trash2 className="h-4 w-4" /> Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ===== BANNERS TAB ===== */}
            {activeTab === 'banners' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold font-display">Gestão de Banners</h2>
                  <Button
                    onClick={() => {
                      resetBannerForm()
                      setShowBannerForm(true)
                    }}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" /> Novo Banner
                  </Button>
                </div>

                {/* Banner Form */}
                {showBannerForm && (
                  <div className="bg-card border border-border rounded-2xl p-6 mb-6 animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">
                      {editingBanner ? 'Editar Banner' : 'Novo Banner'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-sm font-medium">Título (Opcional)</label>
                        <Input
                          value={bannerForm.title}
                          onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                          placeholder="Ex: Promoção de Inauguração"
                        />
                      </div>
                      
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-sm font-medium">Imagem do Banner (PNG/JPG/GIF)</label>
                        <div className="flex gap-2">
                          <Input
                            value={bannerForm.image_url}
                            onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                            placeholder="URL ou selecione um arquivo..."
                          />
                          <Button type="button" variant="outline" className="shrink-0 relative overflow-hidden" aria-label="Escolher Imagem">
                            <ImagePlus className="h-4 w-4" />
                            <input 
                              type="file" 
                              accept="image/png, image/jpeg, image/gif" 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleImagePick(e, (base64) => setBannerForm({ ...bannerForm, image_url: base64 }))} 
                            />
                          </Button>
                        </div>
                        {bannerForm.image_url && bannerForm.image_url.startsWith('data:image') && (
                          <div className="mt-2 text-xs text-success font-medium">✔ Imagem carregada pronta para salvar</div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium">Ordem de Exibição</label>
                        <Input
                          type="number"
                          value={bannerForm.order}
                          onChange={(e) => setBannerForm({ ...bannerForm, order: e.target.value })}
                          placeholder="Ex: 1"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium">Linkar a um Produto (Opcional)</label>
                        <select
                          value={bannerForm.product_id}
                          onChange={(e) => setBannerForm({ ...bannerForm, product_id: e.target.value })}
                          className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Nenhum (Apenas imagem)</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatCurrency(p.price)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 mt-6">
                        <input
                          type="checkbox"
                          checked={bannerForm.active}
                          onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                          className="w-4 h-4 accent-primary"
                        />
                        <label className="text-sm font-medium">Ativo</label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" onClick={resetBannerForm}>Cancelar</Button>
                      <Button onClick={handleSaveBanner}>
                        {editingBanner ? 'Salvar Alterações' : 'Criar Banner'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Banners List */}
                <div className="space-y-3">
                  {banners.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MonitorPlay className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Nenhum banner cadastrado</p>
                      <Button onClick={async () => {
                        const { DEMO_BANNERS } = await import('@/lib/demo-data');
                        for (const b of DEMO_BANNERS) {
                          await supabase.from('banners').insert({
                            title: b.title, image_url: b.image_url, order: b.order, active: b.active
                          } as never);
                        }
                        window.location.reload();
                      }} className="mt-4" variant="outline">
                        Importar Banners Demo
                      </Button>
                    </div>
                  ) : (
                    banners.map((banner) => (
                      <div
                        key={banner.id}
                        className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-16 rounded-lg bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center mt-1">
                            {banner.image_url ? (
                              <img
                                src={banner.image_url}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-base truncate">{banner.title || 'Sem título'}</h3>
                              {!banner.active && (
                                <Badge variant="danger">Inativo</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Ordem: {banner.order}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditBanner(banner)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" /> Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="text-danger hover:text-danger hover:bg-danger/10 gap-2"
                          >
                            <Trash2 className="h-4 w-4" /> Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ===== CUSTOMERS TAB ===== */}
            {activeTab === 'customers' && (
              <div>
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  CRM — Clientes
                </h2>

                {customers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Nenhum cliente cadastrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Cliente</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Telefone</th>
                          <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">Pedidos</th>
                          <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">Total Gasto</th>
                          <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">Ticket Médio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr 
                            key={customer.id} 
                            className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setShowCustomerModal(true)
                            }}
                          >
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-semibold text-sm">{customer.full_name || '—'}</p>
                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm">{customer.phone || '—'}</td>
                            <td className="py-3 px-2 text-sm text-right">{customer.order_count || 0}</td>
                            <td className="py-3 px-2 text-sm text-right font-semibold text-primary">
                              {formatCurrency(customer.total_spent || 0)}
                            </td>
                            <td className="py-3 px-2 text-sm text-right">
                              {customer.order_count
                                ? formatCurrency((customer.total_spent || 0) / customer.order_count)
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {/* ===== FINANCE TAB ===== */}
            {activeTab === 'finance' && (
              <div>
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Painel Financeiro
                </h2>
                <FinanceTab orders={orders} />
              </div>
            )}

            {/* ===== INVENTORY TAB ===== */}
            {activeTab === 'inventory' && (
              <div>
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Controle de Estoque
                </h2>
                <InventoryTab />
              </div>
            )}

            {/* ===== DELIVERY TAB ===== */}
            {activeTab === 'delivery' && (
              <div>
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Gestão de Entregas
                </h2>
                <DeliveryTab />
              </div>
            )}
          </>
        )}
      </div>

      <CustomerProfileModal
        customer={selectedCustomer}
        orders={orders}
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onUpdate={(updated) => {
          setCustomers(customers.map(c => c.id === updated.id ? updated : c))
          setSelectedCustomer(updated)
        }}
      />
    </div>
  )
}
