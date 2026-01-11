import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateEnvVars } from '@/app/lib/utils/env-validation';

// Note: Environment variables are validated at runtime in createClient()
// This allows the build to proceed even if env vars are missing
// The actual runtime will fail with a clear error message

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    const isVercel = process.env.VERCEL === '1';
    
    // Debug info for troubleshooting
    console.error('🔴 Supabase Environment Variables Missing (Server-Side)');
    console.error('VERCEL env:', process.env.VERCEL);
    console.error('Is Vercel:', isVercel);
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'undefined');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'exists but empty' : 'undefined');
    
    const errorMessage = isVercel
      ? 'Missing Supabase environment variables in Vercel. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Settings → Environment Variables, then redeploy. (Check server logs for details)'
      : 'Missing Supabase environment variables. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. (Check server logs for details)';
    throw new Error(errorMessage);
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
