from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_remove_profile_avatar_url_remove_profile_full_name_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TABLE IF NOT EXISTS authtoken_token (
                key varchar(40) PRIMARY KEY,
                created timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
                user_id uuid NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_authtoken_user ON authtoken_token (user_id);
            """,
            reverse_sql="""
            DROP TABLE IF EXISTS authtoken_token;
            """,
        ),
    ]
