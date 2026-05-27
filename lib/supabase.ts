import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// For client components - lazy singleton
let _client: ReturnType<typeof createSupabaseClient> | null = null;
export function getSupabase() {
  if (!_client) _client = createSupabaseClient();
  return _client;
}
