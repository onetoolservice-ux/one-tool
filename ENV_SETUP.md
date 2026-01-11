# Environment Variables Setup

## ⚠️ IMPORTANT: Create .env.local File

You need to create a `.env.local` file in the project root directory (same level as `package.json`).

## Steps:

1. **Create the file**: In your project root, create a new file named `.env.local`

2. **Add these lines** (replace with your actual Supabase credentials):
   ```
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

3. **Save the file**

4. **Restart your dev server** (stop `npm run dev` and start it again)

   Next.js only reads `.env.local` files when the server starts.

## Verification:

After creating the file and restarting, the error should disappear.

## Notes:

- `.env.local` is already in `.gitignore` (won't be committed to git)
- These are public keys (safe to use in client-side code)
- Never commit secret keys to git
