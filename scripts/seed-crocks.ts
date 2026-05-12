import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kxpjotsmxzmjuxiasolc.supabase.co'
const SERVICE_ROLE_KEY = process.argv[2]

async function seed() {
  if (!SERVICE_ROLE_KEY) {
    console.error('Forneça a service_role key como argumento.')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  // 1. Promote admin in DB to fix RLS issues
  console.log('1. Promovendo admin@spaghetti.com a admin no DB...')
  const { data: users } = await supabase.auth.admin.listUsers()
  const adminUser = users?.users?.find(u => u.email === 'admin@spaghetti.com')
  
  if (adminUser) {
    await supabase.from('profiles').upsert({
      id: adminUser.id,
      email: 'admin@spaghetti.com',
      role: 'admin',
      full_name: 'Administrador'
    })
    console.log('✅ Admin atualizado no banco de dados!')
  }

  // 2. Clear products
  console.log('2. Limpando produtos antigos...')
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Deleta todos

  // 3. Insert CROCKS
  console.log('3. Inserindo CROCKS...')
  const { error } = await supabase.from('products').insert({
    name: 'CROCKS',
    description: 'BURGUER CROCKS',
    price: 37.99,
    category: 'hamburgueres',
    image_url: 'https://i.postimg.cc/zBcjSTc1/CROCKS.jpg',
    ingredients: ['PÃO BRIOCHE', 'BLEND DE CARNE 130G', '16OG DE MUSSARELA EMPANADA', 'FAROFA DE BACON', 'BARBECUE'],
    available: true
  })

  if (error) {
    console.error('❌ Erro ao inserir CROCKS:', error.message)
  } else {
    console.log('✅ Produto CROCKS inserido com sucesso!')
  }
}

seed()
