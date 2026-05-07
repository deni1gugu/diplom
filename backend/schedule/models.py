from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from accounts.models import Employee


class Shift(models.Model):
    """Рабочая смена"""
    STATUS_CHOICES = [
        ('planned', 'Запланирована'),
        ('completed', 'Завершена'),
        ('cancelled', 'Отменена'),
    ]
    
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='shifts',
        verbose_name='Сотрудник'
    )
    date = models.DateField(verbose_name='Дата')
    start_time = models.TimeField(verbose_name='Время начала')
    end_time = models.TimeField(verbose_name='Время окончания')
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='planned',
        verbose_name='Статус'
    )
    note = models.TextField(blank=True, verbose_name='Примечание')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Смена'
        verbose_name_plural = 'Смены'
        ordering = ['-date', 'start_time']
        unique_together = ['employee', 'date', 'start_time']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.start_time}-{self.end_time})"

    def clean(self):
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError('Время начала должно быть раньше времени окончания')


class TimeRecord(models.Model):
    """Запись о фактическом рабочем времени"""
    shift = models.ForeignKey(
        Shift, 
        on_delete=models.CASCADE, 
        related_name='time_records',
        verbose_name='Смена'
    )
    check_in = models.DateTimeField(null=True, blank=True, verbose_name='Время прихода')
    check_out = models.DateTimeField(null=True, blank=True, verbose_name='Время ухода')
    note = models.TextField(blank=True, verbose_name='Примечание')
    is_late = models.BooleanField(default=False, verbose_name='Опоздание')
    is_early_departure = models.BooleanField(default=False, verbose_name='Ранний уход')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Запись о рабочем времени'
        verbose_name_plural = 'Записи о рабочем времени'
        ordering = ['-created_at']

    def __str__(self):
        return f"Запись: {self.shift.employee.full_name} - {self.shift.date}"

    def save(self, *args, **kwargs):
        # Вычисляем опоздание и ранний уход
        if self.check_in and self.shift:
            shift_datetime = timezone.make_aware(
                timezone.datetime.combine(self.shift.date, self.shift.start_time)
            )
            self.is_late = self.check_in > shift_datetime
        
        if self.check_out and self.shift:
            shift_end_datetime = timezone.make_aware(
                timezone.datetime.combine(self.shift.date, self.shift.end_time)
            )
            self.is_early_departure = self.check_out < shift_end_datetime
        
        super().save(*args, **kwargs)

    @property
    def worked_hours(self):
        """Вычисляет отработанные часы"""
        if self.check_in and self.check_out:
            duration = self.check_out - self.check_in
            return round(duration.total_seconds() / 3600, 2)
        return 0