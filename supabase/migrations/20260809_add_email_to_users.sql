-- Add email column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE email IS NOT NULL;

-- Populate email from auth.users (if users exist in auth)
UPDATE users u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id AND u.email IS NULL;
