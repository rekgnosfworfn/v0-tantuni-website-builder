-- Add username and password fields to admin_users table for custom authentication

-- Drop the foreign key constraint to auth.users if it exists
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_id_fkey;

-- Modify admin_users table structure
ALTER TABLE admin_users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE admin_users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add username and password_hash columns
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make username and password_hash required for new entries
-- (existing entries might not have them, so we don't set NOT NULL yet)

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- Insert a default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt (you should change this after first login)
-- This is a bcrypt hash of 'admin123' with salt rounds 10
INSERT INTO admin_users (username, password_hash, email, full_name)
VALUES (
  'admin',
  '$2a$10$rN8qLqBvHXqEVqVIKl0sHO4xJKCZ.tFPGKcXvYKVhzKYH3pTQQQfC',
  'admin@tantuni.com',
  'Yönetici'
)
ON CONFLICT (username) DO NOTHING;
