from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Department, Employee


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class DepartmentSerializer(serializers.ModelSerializer):
    employees_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'head', 'employees_count', 'created_at']
        read_only_fields = ['created_at']

    def get_employees_count(self, obj):
        return obj.employees.filter(is_active=True).count()


class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='user',
        required=False,  # ИСПРАВЛЕНО: не обязательное, создаём сами
    )
    department_name = serializers.CharField(source='department.name', read_only=True)

    # ИСПРАВЛЕНО: поля для создания нового пользователя
    username = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'user_id', 'username', 'password',
            'full_name', 'position', 'department', 'department_name',
            'phone', 'email', 'role', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']

    def create(self, validated_data):
        # Извлекаем данные пользователя
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)

        # Если user не передан — создаём нового
        if 'user' not in validated_data:
            if not username or not password:
                raise serializers.ValidationError(
                    {'username': 'Укажите логин и пароль для нового сотрудника'}
                )
            if User.objects.filter(username=username).exists():
                raise serializers.ValidationError(
                    {'username': 'Пользователь с таким логином уже существует'}
                )
            user = User.objects.create_user(username=username, password=password)
            validated_data['user'] = user

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # При обновлении username и password игнорируем
        validated_data.pop('username', None)
        validated_data.pop('password', None)
        validated_data.pop('user', None)
        return super().update(instance, validated_data)


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'full_name', 'position', 'department_name', 'phone', 'email', 'role', 'is_active']