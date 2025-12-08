import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client (for API routes)
// Uses service role key if available, otherwise uses anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment variables")
}

// Use service role key if available, otherwise fall back to anon key
// Note: Service role key bypasses RLS, anon key respects RLS
const apiKey = supabaseServiceKey || supabaseAnonKey

if (!apiKey) {
  throw new Error(
    "Missing Supabase API key. Please set either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  )
}

// Server client - bypasses RLS when using service role key
export const supabaseServer = createClient(supabaseUrl, apiKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

