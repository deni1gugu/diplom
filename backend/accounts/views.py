from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Department, Employee
from .serializers import (
    UserSerializer, DepartmentSerializer,
    EmployeeSerializer, EmployeeListSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Пользовательское разрешение: админ может всё, остальные только читают"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.employee_profile.role == 'admin'


class DepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet для управления подразделениями"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = Department.objects.prefetch_related('employees')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class EmployeeViewSet(viewsets.ModelViewSet):
    """ViewSet для управления сотрудниками"""
    queryset = Employee.objects.select_related('user', 'department').all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        return EmployeeSerializer
    
    def get_queryset(self):
        queryset = Employee.objects.select_related('user', 'department')
        department = self.request.query_params.get('department', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if department:
            queryset = queryset.filter(department_id=department)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Сотрудник видит только свой профиль
        if self.request.user.employee_profile.role != 'admin':
            queryset = queryset.filter(user=self.request.user)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Получить профиль текущего пользователя"""
        employee = request.user.employee_profile
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Активация/деактивация сотрудника"""
        employee = self.get_object()
        employee.is_active = not employee.is_active
        employee.save()
        return Response({'status': 'updated', 'is_active': employee.is_active})