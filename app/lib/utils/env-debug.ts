/**
 * Debug utility to check if environment variables are loaded
 * This helps troubleshoot Vercel deployment issues
 */

export function debugEnvVars() {
  if (typeof window === 'undefined') {
    // Server-side
    console.log('=== Server-Side Environment Variables ===');
    console.log('VERCEL:', process.env.VERCEL);
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : '❌ Missing');
  } else {
    // Client-side
    console.log('=== Client-Side Environment Variables ===');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : '❌ Missing');
    console.log('Hostname:', window.location.hostname);
  }
}
