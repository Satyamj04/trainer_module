ALTER TABLE users ADD COLUMN IF NOT EXISTS username varchar(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superuser boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_staff boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_joined timestamp without time zone DEFAULT CURRENT_TIMESTAMP;
-- set username to email for existing rows
UPDATE users SET username = email WHERE username IS NULL;