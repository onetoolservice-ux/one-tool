# Vercel Environment Variables - Troubleshooting Guide

## 🔍 Step-by-Step Debugging

### Step 1: Verify Variables Are Actually Set in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Look for these EXACT variable names (case-sensitive):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Check the **Environment** column - make sure they're set for:
   - ✅ **Production** (if deploying to production)
   - ✅ **Preview** (if using preview deployments)
   - ✅ **Development** (for local dev)

### Step 2: Check Variable Values

Click on each variable to edit and verify:
- ✅ No leading spaces before the variable name
- ✅ No quotes around the value
- ✅ Value matches your Supabase dashboard exactly
- ✅ URL starts with `https://`
- ✅ Anon key starts with `eyJ` (JWT format)

**Example of CORRECT format:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xdgfgwqzhrxudjgloyam.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: CRITICAL - Redeploy After Adding Variables

**This is the #1 reason why variables don't work!**

After adding/updating environment variables:

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. ✅ Check **"Use existing Build Cache"** - UNCHECK this (to ensure fresh build)
6. Click **"Redeploy"**

**OR** push a new commit to trigger a fresh deployment.

### Step 4: Check Build Logs

After redeploying, check the build logs:

1. Go to **Deployments** → Click on the deployment
2. Scroll through the build logs
3. Look for any errors about environment variables
4. The logs should show the build completing successfully

### Step 5: Check Browser Console (If Error Persists)

If you still see the error after redeploying:

1. Open your deployed site
2. Open Browser DevTools (F12)
3. Go to **Console** tab
4. Look for error messages starting with "🔴 Supabase Environment Variables Missing"
5. Check what it says about the variables

### Step 6: Verify Variables Are Being Read

Add this temporary check to see if variables are loaded:

1. In your Vercel deployment, check the browser console
2. Look for the debug messages I added
3. They will show:
   - Whether variables are set
   - The hostname
   - Whether it detects Vercel

## 🚨 Common Mistakes

### Mistake 1: Forgot to Redeploy
**Symptom:** Added variables but still seeing error
**Fix:** MUST redeploy after adding variables

### Mistake 2: Wrong Environment Selected
**Symptom:** Variables set but not for Production
**Fix:** Set variables for Production environment

### Mistake 3: Typo in Variable Name
**Symptom:** Variables added but not recognized
**Fix:** Check exact spelling: `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)

### Mistake 4: Extra Spaces or Quotes
**Symptom:** Variables set but empty
**Fix:** Remove any spaces or quotes around values

### Mistake 5: Using Wrong Key
**Symptom:** Variables set but authentication fails
**Fix:** Use the "anon/public" key, NOT the "service_role" key

## ✅ Quick Verification Checklist

Before asking for help, verify:

- [ ] Variables added in Vercel Settings → Environment Variables
- [ ] Variable names are EXACTLY: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Variables set for Production environment
- [ ] No spaces or quotes in values
- [ ] Redeployed after adding variables (with cache cleared)
- [ ] Checked build logs for errors
- [ ] Checked browser console for debug messages
- [ ] Verified Supabase project is active
- [ ] Using correct anon key (starts with `eyJ...`)

## 🆘 Still Not Working?

If you've done everything above:

1. **Double-check Vercel Dashboard:**
   - Screenshot your Environment Variables page (blur the actual keys)
   - Verify the environment column shows "Production"

2. **Check Deployment:**
   - Go to latest deployment
   - Check if it was deployed AFTER you added the variables
   - Look at build logs for any errors

3. **Try This:**
   - Delete the variables
   - Add them again
   - Redeploy with cache cleared

4. **Contact Support:**
   - Share your Vercel project URL
   - Share the exact error message
   - Share when you added the variables vs when you deployed
