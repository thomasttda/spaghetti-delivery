'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Auto-complete domain for custom admin login
    const loginEmail = email.includes('@') ? email : `${email}@spaghettiexpresso.com`

    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password })

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const signUpEmail = email.includes('@') ? email : `${email}@spaghettiexpresso.com`
    const { data, error } = await supabase.auth.signUp({ email: signUpEmail, password })

    if (error) {
      setError(error.message)
    } else if (data.user) {
      // Como configuramos um TRIGGER no banco, o perfil base já foi criado!
      // Precisamos apenas atualizar com os dados extras (nome e telefone)
      await supabase.from('profiles').update({
        full_name: name,
        phone: phone,
      } as never).eq('id', data.user.id)

      if (data.session) {
        // Auto-login automático (Se a confirmação de e-mail estiver desligada)
        router.push('/')
      } else {
        // Se a confirmação de e-mail estiver ligada, mostrar a mensagem:
        setSuccess('Verifique seu e-mail para confirmar a conta antes de entrar.')
        setIsSignUp(false)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Menu
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-20 h-20 mb-2">
              <Image src="/logo_spaghetti.png" alt="Spaghetti Expresso" fill className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              SPAGHETTI EXPRESSO
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp ? 'Crie sua conta' : 'Entre na sua conta'}
            </p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success/10 border border-success/30 text-success text-sm p-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nome Completo</label>
                  <Input
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> Login / E-mail
              </label>
              <Input
                type="text"
                placeholder="seu@email.com ou login"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Criar Conta
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
              }}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              {isSignUp
                ? 'Já tem conta? Faça login'
                : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
