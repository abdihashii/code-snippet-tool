import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@supabase/supabase-js';

interface SupabaseEnv {
  SUPABASE_API_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(env: SupabaseEnv): SupabaseClient {
  if (!supabaseInstance) {
    if (!env.SUPABASE_API_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase URL or Service Role Key is missing in bindings.');
    }
    supabaseInstance = createClient(
      env.SUPABASE_API_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  return supabaseInstance;
}
