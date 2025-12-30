from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0004_remove_course_category_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Ensure enrollments table exists with expected columns
            CREATE TABLE IF NOT EXISTS enrollments (
                id uuid PRIMARY KEY,
                course_id uuid REFERENCES courses(course_id) ON DELETE CASCADE,
                user_id uuid REFERENCES users(user_id) ON DELETE CASCADE,
                assigned_by uuid,
                status varchar(20) NOT NULL DEFAULT 'assigned',
                progress_percentage integer NOT NULL DEFAULT 0,
                assigned_at timestamp without time zone NOT NULL DEFAULT now(),
                started_at timestamp without time zone,
                completed_at timestamp without time zone
            );
            -- Make sure unique constraint exists
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'enrollments_course_user_idx') THEN
                    CREATE UNIQUE INDEX IF NOT EXISTS enrollments_course_user_idx ON enrollments(course_id, user_id);
                END IF;
            END$$;

            -- Add assigned_by_id alias column if missing and make it an FK to users.user_id
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollments' AND column_name='assigned_by_id') THEN
                    ALTER TABLE enrollments ADD COLUMN assigned_by_id uuid;
                    UPDATE enrollments SET assigned_by_id = assigned_by;
                    BEGIN
                        ALTER TABLE enrollments ADD CONSTRAINT enrollments_assigned_by_fk FOREIGN KEY (assigned_by_id) REFERENCES users(user_id);
                    EXCEPTION WHEN OTHERS THEN
                        -- ignore if constraint exists or fails for any reason
                        RAISE NOTICE 'Could not add enrollments_assigned_by_fk (may already exist)';
                    END;
                END IF;
            END$$;

            -- Add created_by_id alias column on teams if missing and FK
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='created_by_id') THEN
                    ALTER TABLE teams ADD COLUMN created_by_id uuid;
                    UPDATE teams SET created_by_id = created_by;
                    BEGIN
                        ALTER TABLE teams ADD CONSTRAINT teams_created_by_fk FOREIGN KEY (created_by_id) REFERENCES users(user_id);
                    EXCEPTION WHEN OTHERS THEN
                        RAISE NOTICE 'Could not add teams_created_by_fk (may already exist)';
                    END;
                END IF;
            END$$;

            -- No-op: ensure team_members columns are the expected names (team_id,user_id) — nothing to do if present.
            """,
            reverse_sql="""
            -- Reverse: drop the alias columns and constraints (safe-guard)
            ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_created_by_fk;
            ALTER TABLE teams DROP COLUMN IF EXISTS created_by_id;
            ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_assigned_by_fk;
            ALTER TABLE enrollments DROP COLUMN IF EXISTS assigned_by_id;
            -- Note: we intentionally do not drop the enrollments table in reverse to avoid accidental data loss.
            """,
        )
    ]
