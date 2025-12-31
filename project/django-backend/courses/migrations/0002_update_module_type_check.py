from django.db import migrations


class Migration(migrations.Migration):

    # This file used to update the module_type check constraint but was superseded
    # by a later migration to avoid migration graph conflicts. Leave as a no-op
    # that depends on the latest real migration.

    dependencies = [
        ('courses', '0007_add_team_members_assigned_by_id'),
    ]

    operations = []

