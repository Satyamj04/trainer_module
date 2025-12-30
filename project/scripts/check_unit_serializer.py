import os,sys
proj_root = os.path.dirname(os.path.dirname(__file__))
sys.path.append(os.path.join(proj_root,'django-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE','trainer_lms.settings')
import django
django.setup()
from courses.serializers import UnitSerializer
tests=[
    {'course':'91474dce-2be5-4620-bc3a-7448cf6beef4','type':'video','title':'grammer','order':0},
    {'course':'91474dce-2be5-4620-bc3a-7448cf6beef4','module_type':'video','title':'grammer','sequence_order':0},
    {'course':'91474dce-2be5-4620-bc3a-7448cf6beef4','type':'video','module_type':'video','title':'grammer','order':0,'sequence_order':0}
]
for payload in tests:
    ser=UnitSerializer(data=payload)
    print('payload', payload)
    print('is_valid', ser.is_valid())
    print('errors', ser.errors)
    print('validated', getattr(ser,'validated_data', None))
    print('---')

