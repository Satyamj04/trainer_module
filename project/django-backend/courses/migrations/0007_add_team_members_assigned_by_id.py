from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0006_add_team_members_id'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='assigned_by_id') THEN
                    ALTER TABLE team_members ADD COLUMN assigned_by_id uuid;
                    UPDATE team_members SET assigned_by_id = assigned_by;
                    BEGIN
                        ALTER TABLE team_members ADD CONSTRAINT team_members_assigned_by_fk FOREIGN KEY (assigned_by_id) REFERENCES users(user_id);
                    EXCEPTION WHEN OTHERS THEN
                        RAISE NOTICE 'Could not add team_members_assigned_by_fk (may already exist)';
                    END;
                END IF;
            END$$;
            """,
            reverse_sql="""
            ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_assigned_by_fk;
            ALTER TABLE team_members DROP COLUMN IF EXISTS assigned_by_id;
            """,
        )
    ]
