# Supabase Setup Instructions

## Step 1: Create Environment File

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Step 2: Run Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste the contents of `DATABASE_SCHEMA.sql`
5. Click "Run" to execute the SQL

This will create:
- `tools` table (global tool catalog)
- `user_profiles` table (user info and roles)
- `user_favorites` table
- `user_recents` table
- `user_tool_data` table (for tool-specific data)
- All necessary RLS policies
- Indexes for performance
- Triggers for auto-creating profiles

## Step 3: Configure OAuth Providers (Optional)

If you want Google/GitHub OAuth:

1. In Supabase Dashboard → Authentication → Providers
2. Enable Google/GitHub provider
3. Configure OAuth credentials (get from Google/GitHub developer console)
4. Add authorized redirect URLs

## Step 4: Set First Admin User

After creating the schema and signing up, you need to set the first admin via SQL (users cannot change their own role for security):

**Option 1: By Email (Recommended)**
1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL (replace `your-email@example.com` with your actual email):

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

**Option 2: Via Table Editor (Bypass RLS)**
1. Go to Supabase Dashboard → Table Editor → `user_profiles`
2. Click on the row for your user
3. In the SQL panel at the bottom, use:
```sql
UPDATE user_profiles SET role = 'admin' WHERE id = 'your-row-id';
```

**Option 3: Use the provided script**
- See `SET_ADMIN_ROLE.sql` for more options

**Note:** The RLS policy prevents users from changing their own role via the UI, so you must use SQL directly.

## Step 5: Seed Tools Data

After the schema is created, you'll need to seed the tools. We'll create a script for this next.
