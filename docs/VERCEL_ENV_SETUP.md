# Vercel Environment Variables Setup Guide

## ⚠️ Troubleshooting: "Missing Supabase environment variables" on Vercel

If you're still seeing this error after adding environment variables to Vercel, follow these steps:

## Step 1: Verify Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Ensure you have BOTH variables set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 2: Check Environment Scope

Make sure the variables are set for the correct environments:
- ✅ **Production** (for production deployments)
- ✅ **Preview** (for preview deployments)
- ✅ **Development** (for local development)

**Important:** Set them for ALL environments you're using!

## Step 3: Verify Variable Values

Double-check that:
- No leading/trailing spaces
- No quotes around the values (Vercel adds them automatically)
- Values match exactly what's in your Supabase dashboard

**Correct format:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xdgfgwqzhrxudjgloyam.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Wrong format:**
```
NEXT_PUBLIC_SUPABASE_URL="https://xdgfgwqzhrxudjgloyam.supabase.co"  ❌ (no quotes)
NEXT_PUBLIC_SUPABASE_URL = https://...  ❌ (no spaces around =)
```

## Step 4: Redeploy After Adding Variables

**CRITICAL:** After adding/updating environment variables in Vercel:

1. Go to **Deployments** tab
2. Click the **"..."** menu on your latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a new deployment

**Environment variables are only loaded during build time, so you MUST redeploy!**

## Step 5: Verify in Build Logs

Check your deployment logs to verify the variables are being read:

1. Go to **Deployments** → Click on a deployment
2. Check the build logs
3. Look for any errors about missing environment variables

## Step 6: Test Locally First

Before deploying to Vercel, test locally:

1. Ensure `.env.local` is set correctly
2. Run `npm run dev`
3. Verify the app works locally
4. Then deploy to Vercel

## Common Issues:

### Issue 1: Variables set but not redeployed
**Solution:** Redeploy your application after adding variables

### Issue 2: Variables set for wrong environment
**Solution:** Set variables for Production, Preview, AND Development

### Issue 3: Typo in variable names
**Solution:** Double-check spelling: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue 4: Old deployment cached
**Solution:** Clear Vercel cache and redeploy

## Quick Checklist:

- [ ] Variables added in Vercel Settings → Environment Variables
- [ ] Variables set for Production environment (at minimum)
- [ ] No spaces or quotes in variable values
- [ ] Redeployed after adding variables
- [ ] Checked build logs for errors
- [ ] Tested locally with `.env.local` first

## Still Having Issues?

If you've followed all steps and still see the error:

1. Check Vercel build logs for the exact error
2. Verify your Supabase project is active
3. Ensure the anon key is correct (starts with `eyJ...`)
4. Try redeploying with "Clear Build Cache" enabled
