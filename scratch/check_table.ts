
import { supabase } from './src/lib/supabase'

async function checkTable() {
  const { error } = await supabase.from('settings').select('*').limit(1)
  if (error) {
    console.log('Table settings does not exist or error:', error.message)
  } else {
    console.log('Table settings exists!')
  }
}

checkTable()
