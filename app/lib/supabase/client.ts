import { createBrowserClient } from '@supabase/ssr'
import { validateEnvVars } from '@/app/lib/utils/env-validation';

// Note: Environment variables are validated at runtime in createClient()
// During build time (SSR), we handle missing env vars gracefully
// The actual runtime will fail with a clear error message if env vars are missing

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build/SSR when env vars might be missing, provide defaults
  // This prevents build errors - the client won't work but won't crash the build
  if (!supabaseUrl || !supabaseAnonKey) {
    // If we're in a browser and env vars are missing, throw error
    if (typeof window !== 'undefined') {
      throw new Error(
        'Missing Supabase environment variables. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }
    
    // During SSR/build, return a client with placeholder values
    // This prevents build crashes - the client won't function but allows build to complete
    return createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-anon-key'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
