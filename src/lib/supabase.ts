import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function projectUrl(value: string) {
  try {
    return new URL(value.trim()).origin;
  } catch {
    return undefined;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? projectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : undefined;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!url || !anonKey) {
    throw new Error(
      "Falta configurar o Supabase. Coloque NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local."
    );
  }
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
