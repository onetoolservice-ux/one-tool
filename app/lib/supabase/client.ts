import { createBrowserClient } from '@supabase/ssr'
import { validateEnvVars } from '@/app/lib/utils/env-validation';

// Note: Environment variables are validated at runtime in createClient()
// During build time (SSR), we handle missing env vars gracefully
// The actual runtime will fail with a clear error message if env vars are missing

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // During build/SSR when env vars might be missing, provide defaults
  // This prevents build errors - the client won't work but won't crash the build
  if (!supabaseUrl || !supabaseAnonKey) {
    // If we're in a browser and env vars are missing, throw error
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isVercel = hostname.includes('vercel.app') || hostname.includes('vercel.com');
      
      // Debug info for troubleshooting
      console.error('🔴 Supabase Environment Variables Missing');
      console.error('Hostname:', hostname);
      console.error('Is Vercel:', isVercel);
      const urlValue = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const keyValue = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      console.error('NEXT_PUBLIC_SUPABASE_URL:', urlValue || 'undefined', urlValue ? `(length: ${urlValue.length})` : '');
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', keyValue ? `exists but empty/whitespace (length: ${keyValue.length})` : 'undefined');
      
      const errorMessage = isVercel
        ? 'Missing Supabase environment variables in Vercel. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Settings → Environment Variables, then redeploy. (Check browser console for details)'
        : 'Missing Supabase environment variables. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. (Check browser console for details)';
      throw new Error(errorMessage);
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
