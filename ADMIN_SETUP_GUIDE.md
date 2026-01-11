# Setting Your First Admin User

## Why This Error Occurs

The database schema includes a security policy that prevents users from changing their own role. This is intentional to prevent privilege escalation attacks. You need to set the admin role using SQL directly (bypassing the RLS policy).

## Solution: Set Admin Role via SQL

### Step 1: Find Your User Email

1. Sign up/login to your application
2. Note your email address

### Step 2: Run SQL in Supabase Dashboard

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste one of these queries:

**By Email (Easiest):**
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

**For Most Recent User (Automatic):**
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = (
  SELECT user_id 
  FROM user_profiles 
  ORDER BY created_at DESC 
  LIMIT 1
);
```

3. Click **Run** or press `Ctrl+Enter`
4. You should see "Success. No rows returned"

### Step 3: Verify

Run this query to confirm:
```sql
SELECT id, email, role, created_at 
FROM user_profiles 
WHERE role = 'admin';
```

You should see your user with `role = 'admin'`.

## Why Not Through Table Editor?

The Row Level Security (RLS) policy on `user_profiles` prevents users from updating their own role field. This is a security feature. When you run SQL directly in the SQL Editor, it runs with elevated permissions and bypasses RLS.

## Troubleshooting

**Error: "relation user_profiles does not exist"**
- Make sure you ran `DATABASE_SCHEMA.sql` first
- Check that all tables were created successfully

**Error: "No rows updated"**
- Check that the email address matches exactly (case-sensitive in some databases)
- Verify the user exists: `SELECT * FROM user_profiles;`
- Try using the user_id instead of email

**Still can't update?**
- Make sure you're using the SQL Editor (not Table Editor UI)
- Try using the user_id UUID directly (find it in auth.users table)
