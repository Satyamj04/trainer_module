from django.db import migrations


class Migration(migrations.Migration):

    # Make this migration safe to apply regardless of prior branches
    # This migration intentionally has no real dependencies - it's a safe update
    # to the modules check constraint and will be merged into the existing graph.
    dependencies = [
        ('courses', '0007_add_team_members_assigned_by_id'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE modules DROP CONSTRAINT IF EXISTS modules_module_type_check;
            ALTER TABLE modules ADD CONSTRAINT modules_module_type_check CHECK (module_type IN ('text','video','audio','presentation','scorm','xapi','quiz','test','assignment','survey','page','mixed'));
            """,
            reverse_sql="""
            ALTER TABLE modules DROP CONSTRAINT IF EXISTS modules_module_type_check;
            """,
        )
    ]
