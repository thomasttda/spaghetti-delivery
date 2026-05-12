import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
})

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          image_url: string
          category: string
          ingredients: string[]
          available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          price: number
          image_url?: string
          category: string
          ingredients?: string[]
          available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          category?: string
          ingredients?: string[]
          available?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string
          customer_phone: string
          customer_address: string
          customer_email: string | null
          items: OrderItem[]
          subtotal: number
          delivery_fee: number
          discount: number
          total: number
          status: OrderStatus
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          order_number: string
          customer_name: string
          customer_phone: string
          customer_address: string
          customer_email?: string | null
          items: OrderItem[]
          subtotal: number
          delivery_fee?: number
          discount?: number
          total: number
          status?: OrderStatus
          user_id?: string | null
        }
        Update: {
          order_number?: string
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          customer_email?: string | null
          items?: OrderItem[]
          subtotal?: number
          delivery_fee?: number
          discount?: number
          total?: number
          status?: OrderStatus
          user_id?: string | null
        }
      }
      banners: {
        Row: {
          id: string
          image_url: string
          title: string
          active: boolean
          order: number
          product_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          image_url: string
          title?: string
          active?: boolean
          order?: number
          product_id?: string | null
        }
        Update: {
          image_url?: string
          title?: string
          active?: boolean
          order?: number
          product_id?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          order?: number
        }
        Update: {
          name?: string
          slug?: string
          order?: number
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string
          address: string
          role: 'customer' | 'admin'
          total_spent: number
          order_count: number
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          phone?: string
          address?: string
          role?: 'customer' | 'admin'
        }
        Update: {
          email?: string
          full_name?: string
          phone?: string
          address?: string
          role?: 'customer' | 'admin'
          total_spent?: number
          order_count?: number
        }
      }
      cash_flow: {
        Row: {
          id: string
          type: 'in' | 'out'
          amount: number
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          type: 'in' | 'out'
          amount?: number
          description: string
          created_at?: string
        }
        Update: {
          type?: 'in' | 'out'
          amount?: number
          description?: string
        }
      }
      inventory: {
        Row: {
          id: string
          item_name: string
          quantity: number
          min_quantity: number
          unit: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_name: string
          quantity?: number
          min_quantity?: number
          unit: string
        }
        Update: {
          item_name?: string
          quantity?: number
          min_quantity?: number
          unit?: string
          updated_at?: string
        }
      }
      delivery_zones: {
        Row: {
          id: string
          neighborhood: string
          fee: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          neighborhood: string
          fee?: number
          active?: boolean
        }
        Update: {
          neighborhood?: string
          fee?: number
          active?: boolean
        }
      }
    }
  }
}

export type OrderItem = {
  product_id: string
  name: string
  price: number
  quantity: number
  removed_ingredients: string[]
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  preparing: 'Preparando',
  ready: 'Pronto',
  out_for_delivery: 'Saiu para Entrega',
  delivered: 'Entregue',
}
