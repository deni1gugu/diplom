import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #e5e7eb', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, outline: 'none',
  fontFamily: 'inherit', color: '#111827', background: '#fff',
  transition: 'border-color 0.15s',
};

const SummaryCard = ({ label, value, icon, accent }) => (
  <div style={{
    textAlign: 'center', padding: '20px 16px',
    background: accent + '08', borderRadius: 12,
    border: `1px solid ${accent}20`,
    transition: 'transform 0.15s, box-shadow 0.15s',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = `0 4px 12px ${accent}20`;
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
    <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: accent }}>{value ?? '—'}</p>
    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</p>
  </div>
);

const ReportsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  // Загрузка списка сотрудников
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);
        const response = await api.get('/employees/');
        const employeesData = response.data.results || response.data || [];
        setEmployees(employeesData);
      } catch (error) {
        console.error('Ошибка загрузки сотрудников:', error);
        toast.error('Не удалось загрузить список сотрудников');
      } finally {
        setEmployeesLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Установка дат по умолчанию (текущий месяц)
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setDateFrom(firstDayOfMonth.toISOString().split('T')[0]);
    setDateTo(lastDayOfMonth.toISOString().split('T')[0]);
  }, []);

  // Валидация дат
  const validateDates = useCallback(() => {
    if (!dateFrom || !dateTo) {
      toast.warning('Укажите обе даты периода');
      return false;
    }
    if (dateFrom > dateTo) {
      toast.warning('Дата "с" не может быть позже даты "по"');
      return false;
    }
    return true;
  }, [dateFrom, dateTo]);

  // Формирование отчёта
  const handleGenerate = useCallback(async () => {
    if (!selectedEmployee) {
      toast.warning('Выберите сотрудника');
      return;
    }
    if (!validateDates()) return;

    setLoading(true);
    try {
      const response = await api.get('/reports/employee_report/', {
        params: { 
          employee_id: selectedEmployee, 
          date_from: dateFrom, 
          date_to: dateTo 
        }
      });
      setReportData(response.data);
      toast.success('Отчёт успешно сформирован');
    } catch (error) {
      console.error('Ошибка формирования отчёта:', error);
      const errorMessage = error.response?.data?.error || 'Ошибка формирования отчёта';
      toast.error(errorMessage);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee, dateFrom, dateTo, validateDates]);

  // Экспорт в CSV
  const handleExport = useCallback(async () => {
    if (!validateDates()) return;

    setExporting(true);
    try {
      const response = await api.get('/reports/export_csv/', {
        params: { date_from: dateFrom, date_to: dateTo },
        responseType: 'blob',
      });

      // Создаём имя файла
      const fileName = `report_${dateFrom}_to_${dateTo}.csv`;
      
      // Создаём ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Отчёт успешно скачан');
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      toast.error('Ошибка экспорта отчёта');
    } finally {
      setExporting(false);
    }
  }, [dateFrom, dateTo, validateDates]);

  // Обработчики изменения полей
  const handleEmployeeChange = useCallback((e) => {
    setSelectedEmployee(e.target.value);
    setReportData(null); // Сбрасываем отчёт при смене сотрудника
  }, []);

  const handleDateFromChange = useCallback((e) => {
    setDateFrom(e.target.value);
    setReportData(null);
  }, []);

  const handleDateToChange = useCallback((e) => {
    setDateTo(e.target.value);
    setReportData(null);
  }, []);

  // Мемоизированный список сотрудников для выбора
  const employeeOptions = useMemo(() => {
    if (employeesLoading) {
      return <option value="" disabled>Загрузка сотрудников...</option>;
    }
    if (employees.length === 0) {
      return <option value="" disabled>Нет доступных сотрудников</option>;
    }
    return employees.map(emp => (
      <option key={emp.id} value={emp.id}>{emp.full_name}</option>
    ));
  }, [employees, employeesLoading]);

  // Форматирование времени
  const formatTime = useCallback((dateTimeString) => {
    if (!dateTimeString) return '—';
    try {
      return new Date(dateTimeString).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '—';
    }
  }, []);

  // Форматирование даты
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch {
      return '—';
    }
  }, []);

  return (
    <div style={{ fontFamily: "'Geologica', 'Segoe UI', sans-serif" }}>
      {/* Заголовок */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>Отчёты</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
          Анализ рабочего времени сотрудников
        </p>
      </div>

      {/* Фильтры */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        border: '1px solid #e5e7eb', marginBottom: 24,
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#374151' }}>
          🔎 Параметры отчёта
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 12,
          alignItems: 'end'
        }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
              Сотрудник *
            </label>
            <select 
              value={selectedEmployee} 
              onChange={handleEmployeeChange} 
              style={{ ...inputStyle, cursor: 'pointer' }}
              disabled={employeesLoading}
              aria-label="Выберите сотрудника"
            >
              <option value="">Выберите сотрудника</option>
              {employeeOptions}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
              Дата с *
            </label>
            <input 
              type="date" 
              value={dateFrom} 
              onChange={handleDateFromChange} 
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              aria-label="Начальная дата периода"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
              Дата по *
            </label>
            <input 
              type="date" 
              value={dateTo} 
              onChange={handleDateToChange} 
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              aria-label="Конечная дата периода"
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={handleGenerate} 
              disabled={loading || !selectedEmployee || employeesLoading} 
              style={{
                flex: 1,
                background: (loading || !selectedEmployee || employeesLoading) 
                  ? '#93c5fd' 
                  : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '10px 20px', fontWeight: 600, fontSize: 14,
                cursor: (loading || !selectedEmployee || employeesLoading) 
                  ? 'not-allowed' 
                  : 'pointer',
                whiteSpace: 'nowrap', 
                boxShadow: (loading || !selectedEmployee || employeesLoading) 
                  ? 'none' 
                  : '0 4px 12px rgba(37,99,235,0.3)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!loading && selectedEmployee && !employeesLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? '⏳ Формирование...' : '📊 Сформировать'}
            </button>
            <button 
              onClick={handleExport} 
              disabled={exporting || !dateFrom || !dateTo}
              style={{
                background: exporting || !dateFrom || !dateTo ? '#d1fae5' : '#f0fdf4',
                color: '#15803d', border: '1.5px solid #bbf7d0',
                borderRadius: 10, padding: '10px 16px', fontWeight: 600, fontSize: 14,
                cursor: (exporting || !dateFrom || !dateTo) ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
            >
              {exporting ? '⏳ Экспорт...' : '📥 CSV'}
            </button>
          </div>
        </div>
        
        {/* Подсказка */}
        {(!dateFrom || !dateTo) && (
          <p style={{ margin: '12px 0 0', fontSize: 12, color: '#f59e0b' }}>
            ⚠️ Укажите период для формирования отчёта
          </p>
        )}
        {!selectedEmployee && (
          <p style={{ margin: '12px 0 0', fontSize: 12, color: '#f59e0b' }}>
            ⚠️ Выберите сотрудника для формирования отчёта
          </p>
        )}
      </div>

      {/* Результат отчёта */}
      {reportData && (
        <div style={{
          background: '#fff', borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid #e5e7eb', overflow: 'hidden',
        }}>
          {/* Шапка отчёта */}
          <div style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
            color: '#fff',
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                  {reportData.employee?.full_name || 'Сотрудник'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  {reportData.employee?.position || 'Должность не указана'}
                  {reportData.employee?.department && ` · ${reportData.employee.department}`}
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                <p style={{ margin: 0 }}>Период:</p>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#fff' }}>
                  {reportData.period?.date_from || dateFrom} — {reportData.period?.date_to || dateTo}
                </p>
              </div>
            </div>
          </div>

          {/* Сводка */}
          <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: 16 
            }}>
              <SummaryCard 
                label="Рабочих дней" 
                value={reportData.summary?.total_days || 0} 
                icon="📆" 
                accent="#2563eb" 
              />
              <SummaryCard 
                label="Всего часов" 
                value={`${reportData.summary?.total_hours || 0} ч`} 
                icon="⏱️" 
                accent="#10b981" 
              />
              <SummaryCard 
                label="Опозданий" 
                value={reportData.summary?.late_days || 0} 
                icon="⚠️" 
                accent="#ef4444" 
              />
              <SummaryCard 
                label="Ранних уходов" 
                value={reportData.summary?.early_departures || 0} 
                icon="🏃" 
                accent="#f59e0b" 
              />
            </div>
          </div>

          {/* Таблица записей */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Дата', 'Смена', 'Приход', 'Уход', 'Отработано', 'Отметки'].map(h => (
                    <th key={h} style={{ 
                      padding: '12px 20px', textAlign: 'left', fontSize: 11, 
                      fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', 
                      letterSpacing: '0.05em', whiteSpace: 'nowrap'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.records && reportData.records.length > 0 ? (
                  reportData.records.map((record, index) => (
                    <tr key={record.id || index} style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: index % 2 === 0 ? '#fff' : '#fafafa',
                    }}>
                      <td style={{ padding: '13px 20px', fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                        {formatDate(record.date)}
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 13, color: '#6b7280', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {record.start_time || '—'} — {record.end_time || '—'}
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 14, color: '#374151', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {formatTime(record.check_in)}
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 14, color: '#374151', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {formatTime(record.check_out)}
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                        {record.worked_hours || 0} ч
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        {!record.is_late && !record.is_early_departure ? (
                          <span style={{ 
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, 
                            fontWeight: 600, background: '#d1fae5', color: '#065f46',
                            whiteSpace: 'nowrap'
                          }}>
                            ✓ Норма
                          </span>
                        ) : (
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {record.is_late && (
                              <span style={{ 
                                padding: '3px 10px', borderRadius: 20, fontSize: 11, 
                                fontWeight: 600, background: '#fee2e2', color: '#991b1b',
                                whiteSpace: 'nowrap'
                              }}>
                                ⚠️ Опоздание
                              </span>
                            )}
                            {record.is_early_departure && (
                              <span style={{ 
                                padding: '3px 10px', borderRadius: 20, fontSize: 11, 
                                fontWeight: 600, background: '#fff7ed', color: '#92400e',
                                whiteSpace: 'nowrap'
                              }}>
                                🏃 Ранний уход
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
                      <p style={{ margin: 0, fontSize: 14 }}>Нет записей за выбранный период</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Футер */}
          {reportData.records && reportData.records.length > 0 && (
            <div style={{ 
              padding: '12px 20px', 
              background: '#f9fafb', 
              borderTop: '1px solid #e5e7eb', 
              fontSize: 12, 
              color: '#9ca3af',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8
            }}>
              <span>Всего записей: {reportData.records.length}</span>
              <span>
                Всего часов: {reportData.summary?.total_hours || 0} ч
              </span>
            </div>
          )}
        </div>
      )}

      {/* Инструкция при отсутствии отчёта */}
      {!reportData && !loading && (
        <div style={{
          background: '#f9fafb', borderRadius: 16, padding: 48,
          textAlign: 'center', border: '1px dashed #e5e7eb',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#374151' }}>
            Выберите параметры отчёта
          </h3>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6b7280' }}>
            Выберите сотрудника и период для формирования детального отчёта о рабочем времени
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;