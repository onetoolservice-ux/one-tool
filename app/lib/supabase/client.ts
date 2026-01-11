import { createBrowserClient } from '@supabase/ssr'
import { validateEnvVars } from '@/app/lib/utils/env-validation';

// Note: Environment variables are validated at runtime in createClient()
// This allows the build to proceed even if env vars are missing
// The actual runtime will fail with a clear error message

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
