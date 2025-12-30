"""Run Django migrations via management.call_command('migrate') using Django's programmatic API."""
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trainer_lms.settings')

import django
from django.core.management import call_command

if __name__ == '__main__':
    django.setup()
    call_command('migrate', verbosity=1)
