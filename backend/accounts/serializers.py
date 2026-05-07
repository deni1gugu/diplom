from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Department, Employee


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для модели User"""
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
    """Сериализатор для подразделений"""
    employees_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'head', 'employees_count', 'created_at']
        read_only_fields = ['created_at']
    
    def get_employees_count(self, obj):
        return obj.employees.filter(is_active=True).count()


class EmployeeSerializer(serializers.ModelSerializer):
    """Сериализатор для сотрудников"""
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        write_only=True, 
        source='user'
    )
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'user_id', 'full_name', 'position',
            'department', 'department_name', 'phone', 'email',
            'role', 'is_active', 'created_at'
        ]
        read_only_fields = ['created_at']


class EmployeeListSerializer(serializers.ModelSerializer):
    """Упрощённый сериализатор для списка сотрудников"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'full_name', 'position', 'department_name', 'phone']