import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctibcuvfshrkowbcnspf.supabase.co'
const supabaseAnonKey = 'sb_publishable_xefmputJRj1-JV7RFyA8rw_d5d3ZuRF'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
    host: 'db.ctibcuvfshrkowbcnspf.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'GehAtHln9NKubwtS',
    database: 'postgres',
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
})