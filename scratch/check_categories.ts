import { supabase } from '../src/lib/supabase'

async function checkCategories() {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) console.error("Error:", error)
  else console.log("Categories:", data)
}
checkCategories()
