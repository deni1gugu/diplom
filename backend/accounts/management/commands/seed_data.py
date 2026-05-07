from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import Department, Employee


class Command(BaseCommand):
    help = 'Заполняет базу тестовыми данными'

    def handle(self, *args, **kwargs):
        self.stdout.write('Создание тестовых данных...')
        
        admin_user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@school.ru'
        )
        
        dept1 = Department.objects.create(name='Кафедра математики', head='Иванов И.И.')
        dept2 = Department.objects.create(name='Кафедра информатики', head='Петров П.П.')
        dept3 = Department.objects.create(name='Кафедра физики', head='Сидоров С.С.')
        dept4 = Department.objects.create(name='Администрация', head='Директор')
        
        Employee.objects.create(
            user=admin_user,
            full_name='Иванов Иван Иванович',
            position='Заведующий кафедрой',
            department=dept1,
            phone='+7 (999) 111-22-33',
            email='admin@school.ru',
            role='admin'
        )
        
        emp1_user = User.objects.create_user(username='petrova', password='user123')
        Employee.objects.create(user=emp1_user, full_name='Петрова Анна Сергеевна', position='Преподаватель', department=dept1, role='employee')
        
        emp2_user = User.objects.create_user(username='sidorov', password='user123')
        Employee.objects.create(user=emp2_user, full_name='Сидоров Пётр Алексеевич', position='Старший преподаватель', department=dept2, role='employee')
        
        emp3_user = User.objects.create_user(username='kuznetsova', password='user123')
        Employee.objects.create(user=emp3_user, full_name='Кузнецова Мария Дмитриевна', position='Преподаватель', department=dept3, role='employee')
        
        emp4_user = User.objects.create_user(username='user', password='user123')
        Employee.objects.create(user=emp4_user, full_name='Смирнов Алексей Викторович', position='Методист', department=dept4, role='employee')
        
        self.stdout.write(self.style.SUCCESS('ГОТОВО! Тестовые данные созданы!'))
        self.stdout.write('Логин админа: admin / admin123')
        self.stdout.write('Логин сотрудника: user / user123')