/**
 * Seed Admin via Supabase Admin API (Service Role Key)
 * 
 * This script bypasses email rate limits by using the service_role key.
 * 
 * INSTRUCTIONS:
 * 1. Go to Supabase Dashboard → Settings → API
 * 2. Copy the "service_role" key (secret, NOT the anon key)
 * 3. Run: npx tsx scripts/seed-admin-service.ts YOUR_SERVICE_ROLE_KEY
 * 
 * OR: Create the user manually in Supabase Dashboard:
 *   → Authentication → Users → Add User → Add
 *   Email: admin@spaghetti.com
 *   Password: fernanda.adm
 *   Auto Confirm User: ✅
 * 
 * Then run in SQL Editor:
 *   UPDATE profiles SET role = 'admin', full_name = 'Administrador'
 *   WHERE email = 'admin@spaghetti.com';
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kxpjotsmxzmjuxiasolc.supabase.co'
const SERVICE_ROLE_KEY = process.argv[2]

const ADMIN_EMAIL = 'admin@spaghetti.com'
const ADMIN_PASSWORD = 'fernanda.adm'

async function seedAdmin() {
  if (!SERVICE_ROLE_KEY) {
    console.log('❌ Uso: npx tsx scripts/seed-admin-service.ts <SERVICE_ROLE_KEY>')
    console.log('')
    console.log('📋 Encontre a service_role key em:')
    console.log('   Supabase Dashboard → Settings → API → service_role (secret)')
    console.log('')
    console.log('💡 Alternativa manual (sem script):')
    console.log('   1. Supabase Dashboard → Authentication → Users → Add User')
    console.log(`   2. Email: ${ADMIN_EMAIL}`)
    console.log(`   3. Password: ${ADMIN_PASSWORD}`)
    console.log('   4. Marcar "Auto Confirm User" ✅')
    console.log('   5. No SQL Editor, rodar:')
    console.log(`      UPDATE profiles SET role = 'admin', full_name = 'Administrador'`)
    console.log(`      WHERE email = '${ADMIN_EMAIL}';`)
    process.exit(1)
  }

  // Service role client bypasses RLS and rate limits
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('🔧 Criando usuário admin via Admin API...')
  console.log(`   Email: ${ADMIN_EMAIL}`)
  console.log('')

  // Create user via Admin API (no rate limit)
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // Auto-confirm, no email verification needed
  })

  if (userError) {
    if (userError.message.includes('already been registered')) {
      console.log('⚠️  Usuário já existe. Atualizando para admin...')

      // Find user by email
      const { data: users } = await supabase.auth.admin.listUsers()
      const existing = users?.users?.find((u) => u.email === ADMIN_EMAIL)

      if (existing) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .upsert({
            id: existing.id,
            email: ADMIN_EMAIL,
            full_name: 'Administrador',
            phone: '',
            address: '',
            role: 'admin',
          })

        if (updateErr) {
          console.error('❌ Erro ao atualizar perfil:', updateErr.message)
        } else {
          console.log('✅ Perfil atualizado para admin!')
        }
      }
      process.exit(0)
    }

    console.error('❌ Erro ao criar usuário:', userError.message)
    process.exit(1)
  }

  console.log(`✅ Usuário criado: ${userData.user.id}`)

  // Set profile as admin
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: userData.user.id,
      email: ADMIN_EMAIL,
      full_name: 'Administrador',
      phone: '',
      address: '',
      role: 'admin',
    })

  if (profileErr) {
    console.error('⚠️  Erro ao criar perfil:', profileErr.message)
    console.log('   Execute no SQL Editor:')
    console.log(`   UPDATE profiles SET role = 'admin' WHERE email = '${ADMIN_EMAIL}';`)
  } else {
    console.log('✅ Perfil admin criado!')
  }

  console.log('')
  console.log('🎉 Admin pronto!')
  console.log(`   Email: ${ADMIN_EMAIL}`)
  console.log(`   Senha: ${ADMIN_PASSWORD}`)
}

seedAdmin().catch(console.error)
