'use client'

import Image from 'next/image'
import { Sun, Moon, User, LogIn, ShieldCheck } from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import Link from 'next/link'

export function Header() {
  const { theme, toggleTheme } = useThemeStore()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isOpen, setIsOpen] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAdminRole = async (userId: string) => {
      const result = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (result.error) {
        console.warn('[Header] Profile query error:', result.error.message)
        // Fallback: check user metadata
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email === 'admin@spaghetti.com') {
          setIsAdmin(true)
        }
        return
      }

      const profile = result.data as { role: string } | null
      if (profile?.role === 'admin') {
        setIsAdmin(true)
      }
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        if (error.message.includes('Refresh Token') || error.message.includes('refresh_token')) {
          supabase.auth.signOut()
        }
      }
      setUser(data.user ?? null)
      if (data.user) {
        checkAdminRole(data.user.id)
      }
    }).catch(() => {
      supabase.auth.signOut()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAdminRole(session.user.id)
      } else {
        setIsAdmin(false)
      }
    })

    // Check store status
    const fetchStoreStatus = async () => {
      const { data } = await supabase
        .from('banners')
        .select('active')
        .eq('title', '__STORE_CONFIG__')
        .single()
      
      if (data) {
        setIsOpen((data as any).active)
      } else {
        setIsOpen(true) // Default to open
      }
    }

    fetchStoreStatus()

    // Realtime status updates
    const statusChannel = supabase
      .channel('store-status-banner')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'banners', filter: 'title=eq.__STORE_CONFIG__' },
        (payload: any) => {
          if (payload.new) {
            setIsOpen(payload.new.active)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(statusChannel)
    }
  }, [])


  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setShowMenu(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      {isOpen !== null && (
        <div className={`py-1.5 px-4 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${
          isOpen 
            ? 'bg-emerald-500/10 text-emerald-500 border-b border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-500 border-b border-rose-500/20'
        }`}>
          {isOpen ? '🟢 Estamos funcionando' : '🔴 Estamos fechados'}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Espaçador invisível para manter a logo centralizada */}
          <div className="w-10 h-10" aria-hidden="true" />

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center gap-1 group">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo_spaghetti.png"
                alt="Spaghetti Expresso Logo"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-wider bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent dark:from-gold dark:via-gold-light dark:to-gold">
              SPAGHETTI EXPRESSO
            </span>
          </Link>

          {/* Profile */}
          <div className="relative">
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Menu do perfil"
              >
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Login">
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {showMenu && user && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-border bg-card shadow-2xl p-2 animate-fade-in">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-semibold truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <User className="h-4 w-4" /> Meus Pedidos
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-gold"
                      onClick={() => setShowMenu(false)}
                    >
                      <ShieldCheck className="h-4 w-4" /> Painel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-danger w-full text-left cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" /> Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
