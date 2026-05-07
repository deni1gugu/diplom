import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

admin = User.objects.get(username='admin')
print(f'Admin user: {admin.username}')
print(f'Password valid (admin123): {admin.check_password("admin123")}')
print(f'Has usable password: {admin.has_usable_password()}')
