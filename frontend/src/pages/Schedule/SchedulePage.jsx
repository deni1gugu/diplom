import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchShifts, createShift, updateShift, deleteShift } from '../../store/shiftSlice';
import { fetchEmployees } from '../../store/employeeSlice';

const STATUS_MAP = {
  planned:   { label: 'Запланирована', bg: '#dbeafe', color: '#1e40af' },
  completed: { label: 'Завершена',     bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'Отменена',      bg: '#fee2e2', color: '#991b1b' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
};

const inputStyle = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', color: '#111827',
  background: '#fff', transition: 'border-color 0.15s',
};

const EMPTY_FORM = { employee: '', date: '', start_time: '', end_time: '' };

const SchedulePage = () => {
  const dispatch = useDispatch();
  const { items: shifts, loading } = useSelector((state) => state.shifts);
  const { items: employees } = useSelector((state) => state.employees);
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    dispatch(fetchShifts());
    if (isAdmin) dispatch(fetchEmployees());
  }, [dispatch, isAdmin]);

  // Фильтрация смен с учётом роли пользователя
  const accessibleShifts = useMemo(() => {
    if (isAdmin) return shifts;
    return shifts.filter(s => s.employee === user?.id || s.employee?.id === user?.id);
  }, [shifts, isAdmin, user]);

  const filteredShifts = useMemo(() => {
    if (!filterStatus) return accessibleShifts;
    return accessibleShifts.filter(s => s.status === filterStatus);
  }, [accessibleShifts, filterStatus]);

  const setFormField = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const openCreate = () => { setEditingShift(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (shift) => {
    setEditingShift(shift);
    setForm({
      employee: shift.employee?.id || shift.employee,
      date: shift.date,
      start_time: shift.start_time,
      end_time: shift.end_time,
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingShift(null); };

  const validateTime = (startTime, endTime) => {
    if (startTime >= endTime) {
      toast.error('Время окончания должно быть позже времени начала');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateTime(form.start_time, form.end_time)) return;

    try {
      if (editingShift) {
        await dispatch(updateShift({ id: editingShift.id, ...form })).unwrap();
        toast.success('Смена обновлена');
      } else {
        await dispatch(createShift(form)).unwrap();
        toast.success('Смена создана');
      }
      closeForm();
    } catch (error) {
      toast.error(error?.message || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту смену?')) {
      try { 
        await dispatch(deleteShift(id)).unwrap(); 
        toast.success('Смена удалена'); 
      } catch (error) { 
        toast.error(error?.message || 'Ошибка удаления'); 
      }
    }
  };

  if (loading && shifts.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Загрузка расписания...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Geologica', 'Segoe UI', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>Расписание смен</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            {isAdmin ? 'Управление рабочими сменами сотрудников' : 'Ваши рабочие смены'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, width: 160, cursor: 'pointer' }}
          >
            <option value="">Все статусы</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {isAdmin && (
            <button onClick={openCreate} style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 20px', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}>
              + Новая смена
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: 28, marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#111827' }}>
            {editingShift ? '✏️ Редактирование смены' : '➕ Новая смена'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 14 }}>
              {isAdmin && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                    Сотрудник <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select 
                    value={form.employee} 
                    onChange={setFormField('employee')} 
                    style={{ ...inputStyle, cursor: 'pointer' }} 
                    required
                  >
                    <option value="">Выберите сотрудника</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                    Дата <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input type="date" value={form.date} onChange={setFormField('date')} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                    Начало <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input type="time" value={form.start_time} onChange={setFormField('start_time')} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                    Конец <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input type="time" value={form.end_time} onChange={setFormField('end_time')} style={inputStyle} required />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="submit" style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '10px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>
                {editingShift ? 'Сохранить' : 'Создать'}
              </button>
              <button type="button" onClick={closeForm} style={{
                background: '#f3f4f6', color: '#374151', border: 'none',
                borderRadius: 10, padding: '10px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        overflow: 'auto', border: '1px solid #e5e7eb',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Сотрудник</th>
              <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Дата</th>
              <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Время</th>
              <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Статус</th>
              {isAdmin && <th style={{ padding: '13px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280' }}>Действия</th>}
             </tr>
          </thead>
          <tbody>
            {filteredShifts.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <p style={{ margin: 0, fontSize: 14 }}>Нет смен</p>
                </td>
              </tr>
            ) : (
              filteredShifts.map((shift) => (
                <tr key={shift.id} style={{ borderBottom: '1px solid #f3f4f6', background: '#fff' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14, color: '#111827' }}>
                    {shift.employee_name || shift.employee?.full_name || '—'}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151' }}>
                    {new Date(shift.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151', fontFamily: 'monospace' }}>
                    {shift.start_time} — {shift.end_time}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <StatusBadge status={shift.status} />
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(shift)} style={{
                          background: '#eff6ff', color: '#2563eb', border: 'none',
                          borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                        }}>✏️ Изменить</button>
                        <button onClick={() => handleDelete(shift.id)} style={{
                          background: '#fef2f2', color: '#dc2626', border: 'none',
                          borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                        }}>🗑️ Удалить</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {filteredShifts.length > 0 && (
          <div style={{ padding: '12px 20px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', fontSize: 12, color: '#9ca3af' }}>
            Показано записей: {filteredShifts.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;