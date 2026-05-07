from rest_framework import serializers
from .models import Shift, TimeRecord


class TimeRecordSerializer(serializers.ModelSerializer):
    """Сериализатор для записей о рабочем времени"""
    employee_name = serializers.CharField(source='shift.employee.full_name', read_only=True)
    shift_date = serializers.DateField(source='shift.date', read_only=True)
    worked_hours = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = TimeRecord
        fields = [
            'id', 'shift', 'employee_name', 'shift_date',
            'check_in', 'check_out', 'note',
            'is_late', 'is_early_departure', 'worked_hours',
            'created_at'
        ]
        read_only_fields = ['is_late', 'is_early_departure', 'created_at']


class ShiftSerializer(serializers.ModelSerializer):
    """Сериализатор для смен"""
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    time_records = TimeRecordSerializer(many=True, read_only=True)
    has_time_record = serializers.SerializerMethodField()
    
    class Meta:
        model = Shift
        fields = [
            'id', 'employee', 'employee_name', 'date',
            'start_time', 'end_time', 'status', 'note',
            'time_records', 'has_time_record', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_has_time_record(self, obj):
        return obj.time_records.exists()
    
    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError(
                "Время начала должно быть раньше времени окончания"
            )
        return data


class ShiftCalendarSerializer(serializers.ModelSerializer):
    """Сериализатор для отображения в календаре"""
    title = serializers.SerializerMethodField()
    
    class Meta:
        model = Shift
        fields = ['id', 'employee', 'date', 'start_time', 'end_time', 'status', 'title']
    
    def get_title(self, obj):
        return f"{obj.employee.full_name}\n{obj.start_time}-{obj.end_time}"


class CheckInSerializer(serializers.Serializer):
    """Сериализатор для отметки времени"""
    shift_id = serializers.IntegerField()
    timestamp = serializers.DateTimeField(required=False)