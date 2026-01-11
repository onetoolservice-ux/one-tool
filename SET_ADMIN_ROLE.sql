-- ==========================================
-- Set Admin Role for First User
-- ==========================================
-- This script sets the first admin user
-- Run this in Supabase SQL Editor
-- ==========================================

-- OPTION 1: Set admin role by email (RECOMMENDED)
-- Replace 'your-email@example.com' with your actual email
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- OPTION 2: Set admin role for the most recently created user
-- This automatically sets the newest user as admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = (
  SELECT user_id 
  FROM user_profiles 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- OPTION 3: Set admin role by user ID (if you know the auth.users UUID)
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from auth.users table
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = 'YOUR_USER_ID_HERE';

-- ==========================================
-- Verify the change worked:
-- ==========================================
SELECT id, email, role, created_at 
FROM user_profiles 
WHERE role = 'admin';
