from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, F  # ← Добавлен импорт Avg и F
from datetime import timedelta
from .models import Shift, TimeRecord
from accounts.models import Employee  # ← Добавлен импорт Employee
from .serializers import ShiftSerializer, TimeRecordSerializer


class IsAdminOrOwner(permissions.BasePermission):
    """Админ видит всё, сотрудник только свои записи"""
    def has_object_permission(self, request, view, obj):
        if hasattr(request.user, 'employee_profile') and request.user.employee_profile.role == 'admin':
            return True
        return obj.employee.user == request.user


class ShiftViewSet(viewsets.ModelViewSet):
    """ViewSet для управления сменами"""
    queryset = Shift.objects.select_related('employee__user', 'employee__department')
    serializer_class = ShiftSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOwner]
    
    def get_queryset(self):
        queryset = Shift.objects.select_related(
            'employee__user', 'employee__department'
        ).prefetch_related('time_records')
        
        user = self.request.user
        if hasattr(user, 'employee_profile') and user.employee_profile.role != 'admin':
            queryset = queryset.filter(employee__user=user)
        
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        employee_id = self.request.query_params.get('employee')
        status_param = self.request.query_params.get('status')
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.order_by('-date', 'start_time')
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Получить смены на сегодня"""
        today = timezone.now().date()
        queryset = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_week(self, request):
        """Мои смены на текущую неделю"""
        user = request.user
        today = timezone.now().date()
        monday = today - timedelta(days=today.weekday())
        sunday = monday + timedelta(days=6)
        
        queryset = Shift.objects.filter(
            employee__user=user,
            date__gte=monday,
            date__lte=sunday
        ).order_by('date', 'start_time')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TimeRecordViewSet(viewsets.ModelViewSet):
    """ViewSet для управления записями о рабочем времени"""
    queryset = TimeRecord.objects.select_related(
        'shift__employee__user', 'shift__employee__department'
    )
    serializer_class = TimeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TimeRecord.objects.select_related(
            'shift__employee__user', 'shift__employee__department'
        )
        
        user = self.request.user
        if hasattr(user, 'employee_profile') and user.employee_profile.role != 'admin':
            queryset = queryset.filter(shift__employee__user=user)
        
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        employee_id = self.request.query_params.get('employee')
        
        if date_from:
            queryset = queryset.filter(shift__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(shift__date__lte=date_to)
        if employee_id:
            queryset = queryset.filter(shift__employee_id=employee_id)
        
        return queryset.order_by('-shift__date', '-created_at')
    
    @action(detail=False, methods=['post'])
    def check_in(self, request):
        """Отметка о начале рабочего дня"""
        shift_id = request.data.get('shift_id')
        if not shift_id:
            return Response(
                {'error': 'Необходим shift_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            shift = Shift.objects.get(id=shift_id)
        except Shift.DoesNotExist:
            return Response(
                {'error': 'Смена не найдена'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Проверка прав доступа
        if hasattr(request.user, 'employee_profile') and shift.employee.user != request.user and request.user.employee_profile.role != 'admin':
            return Response(
                {'error': 'Нет прав для отметки'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Проверка на дубликат
        if TimeRecord.objects.filter(shift=shift, check_in__isnull=False, check_out__isnull=True).exists():
            return Response(
                {'error': 'Уже есть активная запись без отметки окончания'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        time_record = TimeRecord.objects.create(
            shift=shift,
            check_in=timezone.now()
        )
        
        serializer = TimeRecordSerializer(time_record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def check_out(self, request):
        """Отметка об окончании рабочего дня"""
        shift_id = request.data.get('shift_id')
        if not shift_id:
            return Response(
                {'error': 'Необходим shift_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            time_record = TimeRecord.objects.get(
                shift_id=shift_id,
                check_in__isnull=False,
                check_out__isnull=True
            )
        except TimeRecord.DoesNotExist:
            return Response(
                {'error': 'Нет активной записи для этой смены'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        time_record.check_out = timezone.now()
        time_record.save()
        
        # Проверяем, все ли записи закрыты
        shift = time_record.shift
        if not shift.time_records.filter(check_out__isnull=True).exists():
            shift.status = 'completed'
            shift.save()
        
        serializer = TimeRecordSerializer(time_record)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today_status(self, request):
        """Статус за сегодня"""
        user = request.user
        today = timezone.now().date()
        
        shifts = Shift.objects.filter(
            employee__user=user,
            date=today
        )
        
        result = []
        for shift in shifts:
            time_record = shift.time_records.first()
            result.append({
                'shift_id': shift.id,
                'start_time': shift.start_time,
                'end_time': shift.end_time,
                'checked_in': bool(time_record and time_record.check_in),
                'checked_out': bool(time_record and time_record.check_out),
                'check_in_time': time_record.check_in if time_record else None,
                'check_out_time': time_record.check_out if time_record else None,
                'is_late': time_record.is_late if time_record else False,
            })
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Статистика по отработанному времени"""
        user = request.user
        
        if not hasattr(user, 'employee_profile') or user.employee_profile.role != 'admin':
            return Response(
                {'error': 'Только для администраторов'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        # Общая статистика — теперь Employee импортирован и работает
        total_employees = Employee.objects.filter(is_active=True).count()
        today_shifts = Shift.objects.filter(date=today).count()
        
        # Статистика опозданий за неделю
        late_count = TimeRecord.objects.filter(
            is_late=True,
            shift__date__gte=week_ago
        ).count()
        
        # Среднее время работы — теперь Avg импортирован и работает
        records = TimeRecord.objects.filter(
            check_in__isnull=False,
            check_out__isnull=False,
            shift__date__gte=week_ago
        )
        
        # Вычисляем среднее через annotate
        avg_result = records.annotate(
            duration=F('check_out') - F('check_in')
        ).aggregate(avg=Avg('duration'))
        
        avg_hours = 0
        if avg_result['avg']:
            avg_hours = round(avg_result['avg'].total_seconds() / 3600, 1)
        
        return Response({
            'total_employees': total_employees,
            'today_shifts': today_shifts,
            'weekly_late_count': late_count,
            'avg_working_hours': avg_hours,
        })