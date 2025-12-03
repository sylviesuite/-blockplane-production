// scripts/test-supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!  // server-side only

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

async function main() {
  console.log('Testing Supabase connection...')

  // You can change "materials" to whatever table name you know exists
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .limit(5)

  if (error) {
    console.error('❌ Supabase error:', error.message)
    process.exit(1)
  }

  console.log('✅ Got rows from Supabase:')
  console.log(data)
  process.exit(0)
}

main()

