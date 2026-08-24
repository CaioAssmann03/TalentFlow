import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url
  // Guards against the common mistake of pasting the REST endpoint
  // (https://xxx.supabase.co/rest/v1/) instead of the project URL.
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[HireLens Ético] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configurados. ' +
      'Veja o README para instruções de configuração do Supabase.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
)

export const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || 'lumos2026'
