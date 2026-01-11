import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/app/lib/utils/oauth-redirect'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Validate origin to prevent OAuth token hijacking
  if (!validateOrigin(origin)) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=invalid_origin`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Determine redirect URL safely
      let redirectUrl: string
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost) {
        // Validate forwarded host matches allowed origins
        const forwardedOrigin = `https://${forwardedHost}`
        if (validateOrigin(forwardedOrigin)) {
          redirectUrl = `${forwardedOrigin}${next}`
        } else {
          redirectUrl = `${origin}${next}`
        }
      } else {
        redirectUrl = `${origin}${next}`
      }
      
      return NextResponse.redirect(redirectUrl)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
