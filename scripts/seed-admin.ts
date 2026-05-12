/**
 * Seed script: Creates the default admin user in Supabase Auth
 * Run with: npx tsx scripts/seed-admin.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kxpjotsmxzmjuxiasolc.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_wlvVG20M8ThEEJ21bccOsg_2jb_aHC5'

const ADMIN_EMAIL = 'admin@spaghetti.com'
const ADMIN_PASSWORD = 'fernanda.adm'

async function seedAdmin() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  console.log('🔧 Criando usuário admin padrão...')
  console.log(`   Email: ${ADMIN_EMAIL}`)
  console.log(`   Senha: ${ADMIN_PASSWORD}`)
  console.log('')

  // 1. Sign up the admin user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  })

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      console.log('⚠️  Usuário já existe. Tentando fazer login...')
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      })

      if (loginError) {
        console.error('❌ Erro ao fazer login:', loginError.message)
        process.exit(1)
      }

      const userId = loginData.user?.id
      if (!userId) {
        console.error('❌ Não foi possível obter o ID do usuário')
        process.exit(1)
      }

      // Update profile to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: ADMIN_EMAIL,
          full_name: 'Administrador',
          phone: '',
          address: '',
          role: 'admin',
        })

      if (updateError) {
        console.error('❌ Erro ao atualizar perfil:', updateError.message)
        console.log('')
        console.log('💡 Se as tabelas ainda não existem, execute o schema.sql primeiro no Supabase SQL Editor.')
      } else {
        console.log('✅ Perfil atualizado para admin com sucesso!')
      }

      await supabase.auth.signOut()
      process.exit(0)
    }

    console.error('❌ Erro ao criar usuário:', signUpError.message)
    process.exit(1)
  }

  const userId = signUpData.user?.id
  if (!userId) {
    console.error('❌ Não foi possível obter o ID do novo usuário')
    process.exit(1)
  }

  console.log(`✅ Usuário criado com ID: ${userId}`)

  // 2. Insert admin profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: ADMIN_EMAIL,
      full_name: 'Administrador',
      phone: '',
      address: '',
      role: 'admin',
    })

  if (profileError) {
    console.error('⚠️  Erro ao criar perfil:', profileError.message)
    console.log('')
    console.log('💡 Se as tabelas ainda não existem, execute o schema.sql primeiro.')
    console.log('   Depois, rode este SQL no Supabase SQL Editor:')
    console.log(`   UPDATE profiles SET role = 'admin' WHERE email = '${ADMIN_EMAIL}';`)
  } else {
    console.log('✅ Perfil admin criado com sucesso!')
  }

  console.log('')
  console.log('🎉 Admin padrão configurado!')
  console.log(`   Login: ${ADMIN_EMAIL}`)
  console.log(`   Senha: ${ADMIN_PASSWORD}`)
  console.log('')
  console.log('   Acesse: http://localhost:3000/login')

  await supabase.auth.signOut()
}

seedAdmin().catch(console.error)
