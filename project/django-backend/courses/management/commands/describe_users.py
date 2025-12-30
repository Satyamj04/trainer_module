from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Describe columns of users table'

    def handle(self, *args, **options):
        with connection.cursor() as cur:
            cur.execute("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position")
            rows = cur.fetchall()
            for r in rows:
                self.stdout.write(str(r))
