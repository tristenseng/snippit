-- Row Level Security Policies for Cannabis Compliance Privacy Enforcement
-- Apply these policies AFTER running prisma migrate to create the tables.
--
-- Usage:
--   psql $DATABASE_URL -f prisma/rls-policies.sql
--
-- These policies ensure employees cannot access other employees' data,
-- satisfying cannabis industry compliance requirements (UX-02 / AUTH-02 / AUTH-03).

-- Create application role for RLS policies (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated_user') THEN
    CREATE ROLE authenticated_user;
  END IF;
END $$;

-- Enable RLS on user table for privacy compliance
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY user_profile_access ON users
    FOR ALL TO authenticated_user
    USING (id = current_setting('app.current_user_id')::text);

-- Policy: Admins and Managers can see all employee profiles
CREATE POLICY admin_manager_user_access ON users
    FOR SELECT TO authenticated_user
    USING (
        EXISTS (
            SELECT 1 FROM users admin_check
            WHERE admin_check.id = current_setting('app.current_user_id')::text
            AND admin_check.role IN ('ADMIN', 'MANAGER')
        )
    );

-- Policy: Admins and Managers can create/update/delete all user profiles
CREATE POLICY admin_manager_write_access ON users
    FOR ALL TO authenticated_user
    USING (
        EXISTS (
            SELECT 1 FROM users admin_check
            WHERE admin_check.id = current_setting('app.current_user_id')::text
            AND admin_check.role IN ('ADMIN', 'MANAGER')
        )
    );

-- Note: The app.current_user_id setting must be set per transaction in application code.
-- Example (via Prisma Client Extension or raw query):
--   await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
