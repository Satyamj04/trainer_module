from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0005_sync_schema'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Add an 'id' primary key to team_members if it is missing
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='id') THEN
                    ALTER TABLE team_members ADD COLUMN id bigserial;
                    -- Only add primary key constraint if none exists
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'team_members'::regclass AND contype = 'p') THEN
                        ALTER TABLE team_members ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);
                    END IF;
                END IF;
            END$$;
            """,
            reverse_sql="""
            ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_pkey;
            ALTER TABLE team_members DROP COLUMN IF EXISTS id;
            """,
        )
    ]
