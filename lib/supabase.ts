import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bgmywsfvehgsuwuumdax.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbXl3c2Z2ZWhnc3V3dXVtZGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTI0NjAsImV4cCI6MjA2NzA2ODQ2MH0.H9z-i3gXu_Sdt3MQvB_YuwcOliUhcM1bOd9EylqA4QQ"

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are not set.")
}

export const supabase = createClient(supabaseUrl, supabaseKey)
