import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

# Обновляем пользователя admin
admin = User.objects.get(username='admin')
admin.is_staff = True
admin.is_superuser = True
admin.save()

print(f'✓ Пользователь admin обновлен:')
print(f'  - Is staff: {admin.is_staff}')
print(f'  - Is superuser: {admin.is_superuser}')
