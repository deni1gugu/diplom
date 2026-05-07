import csv
from io import StringIO
from django.http import HttpResponse
from django.db.models import Sum, F, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime, timedelta
from accounts.models import Employee
from schedule.models import Shift, TimeRecord


class ReportViewSet(viewsets.ViewSet):
    """ViewSet для формирования отчётов"""
    permission_classes = [permissions.IsAuthenticated]
    
    def _check_admin(self, request):
        """Проверка прав администратора"""
        if request.user.employee_profile.role != 'admin':
            return False
        return True
    
    @action(detail=False, methods=['get'])
    def employee_report(self, request):
        """Отчёт по сотруднику за период"""
        if not self._check_admin(request):
            return Response(
                {'error': 'Только для администраторов'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        employee_id = request.query_params.get('employee_id')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if not all([employee_id, date_from, date_to]):
            return Response(
                {'error': 'Необходимы параметры: employee_id, date_from, date_to'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Сотрудник не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        time_records = TimeRecord.objects.filter(
            shift__employee=employee,
            shift__date__gte=date_from,
            shift__date__lte=date_to,
            check_in__isnull=False,
            check_out__isnull=False
        ).select_related('shift')
        
        records_data = []
        total_hours = 0
        late_days = 0
        
        for record in time_records:
            worked_hours = record.worked_hours
            total_hours += worked_hours
            if record.is_late:
                late_days += 1
            
            records_data.append({
                'date': record.shift.date,
                'start_time': record.shift.start_time,
                'end_time': record.shift.end_time,
                'check_in': record.check_in,
                'check_out': record.check_out,
                'worked_hours': worked_hours,
                'is_late': record.is_late,
                'is_early_departure': record.is_early_departure,
            })
        
        return Response({
            'employee': {
                'id': employee.id,
                'full_name': employee.full_name,
                'position': employee.position,
                'department': employee.department.name if employee.department else None,
            },
            'period': {
                'date_from': date_from,
                'date_to': date_to,
            },
            'summary': {
                'total_days': time_records.count(),
                'total_hours': round(total_hours, 2),
                'late_days': late_days,
                'early_departures': time_records.filter(is_early_departure=True).count(),
            },
            'records': records_data,
        })
    
    @action(detail=False, methods=['get'])
    def department_report(self, request):
        """Отчёт по подразделению"""
        if not self._check_admin(request):
            return Response(
                {'error': 'Только для администраторов'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        department_id = request.query_params.get('department_id')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if not all([department_id, date_from, date_to]):
            return Response(
                {'error': 'Необходимы параметры: department_id, date_from, date_to'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employees = Employee.objects.filter(
            department_id=department_id,
            is_active=True
        )
        
        employees_data = []
        for employee in employees:
            records = TimeRecord.objects.filter(
                shift__employee=employee,
                shift__date__gte=date_from,
                shift__date__lte=date_to,
                check_in__isnull=False,
                check_out__isnull=False
            )
            
            total_hours = sum(r.worked_hours for r in records)
            late_count = records.filter(is_late=True).count()
            
            employees_data.append({
                'employee_id': employee.id,
                'full_name': employee.full_name,
                'position': employee.position,
                'total_days': records.count(),
                'total_hours': round(total_hours, 2),
                'late_days': late_count,
            })
        
        return Response({
            'department_id': department_id,
            'period': {'date_from': date_from, 'date_to': date_to},
            'employees': employees_data,
        })
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Экспорт отчёта в CSV"""
        if not self._check_admin(request):
            return Response(
                {'error': 'Только для администраторов'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if not date_from or not date_to:
            return Response(
                {'error': 'Необходимы параметры date_from и date_to'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        time_records = TimeRecord.objects.filter(
            shift__date__gte=date_from,
            shift__date__lte=date_to,
            check_in__isnull=False,
            check_out__isnull=False
        ).select_related('shift__employee__department')
        
        # Создаём CSV
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="report_{date_from}_{date_to}.csv"'
        response.write('\ufeff')  # BOM для Excel
        
        writer = csv.writer(response, delimiter=';')
        writer.writerow([
            'Сотрудник', 'Подразделение', 'Дата', 
            'Начало смены', 'Конец смены', 'Приход', 'Уход',
            'Отработано часов', 'Опоздание', 'Ранний уход'
        ])
        
        for record in time_records:
            writer.writerow([
                record.shift.employee.full_name,
                record.shift.employee.department.name if record.shift.employee.department else '',
                record.shift.date,
                record.shift.start_time,
                record.shift.end_time,
                record.check_in.strftime('%Y-%m-%d %H:%M:%S') if record.check_in else '',
                record.check_out.strftime('%Y-%m-%d %H:%M:%S') if record.check_out else '',
                record.worked_hours,
                'Да' if record.is_late else 'Нет',
                'Да' if record.is_early_departure else 'Нет',
            ])
        
        return response