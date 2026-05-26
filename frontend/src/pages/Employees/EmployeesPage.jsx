import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchEmployees, deleteEmployee } from '../../store/employeeSlice';
import EmployeeForm from './EmployeeForm';

const Avatar = ({ name }) => {
  const initials = name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';
  const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
      background: color + '18', color, border: `2px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 13,
    }} aria-label={`Аватар ${name}`} role="img">
      {initials}
    </div>
  );
};

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const { items: employees, loading } = useSelector((state) => state.employees);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  // Загрузка данных при монтировании
  useEffect(() => { 
    dispatch(fetchEmployees()); 
  }, [dispatch]);

  // Оптимизированная фильтрация с useMemo
  const filtered = useMemo(() => {
    return employees.filter(e => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = searchTerm === '' || 
        e.full_name?.toLowerCase().includes(searchLower) ||
        e.position?.toLowerCase().includes(searchLower) ||
        e.department_name?.toLowerCase().includes(searchLower);
      
      const matchActive = filterActive === 'all' || 
        (filterActive === 'active' ? e.is_active : !e.is_active);
      
      return matchSearch && matchActive;
    });
  }, [employees, searchTerm, filterActive]);

  // Подсчёт статистики с useMemo
  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.is_active).length,
    inactive: employees.filter(e => !e.is_active).length,
  }), [employees]);

  // Обработчики с useCallback
  const handleDelete = useCallback(async (id, fullName) => {
    if (window.confirm(`Вы уверены, что хотите удалить сотрудника "${fullName || id}"?`)) {
      try { 
        await dispatch(deleteEmployee(id)).unwrap(); 
        toast.success('Сотрудник удалён');
        // Обновляем список после удаления
        dispatch(fetchEmployees());
      } catch (error) { 
        toast.error(error?.message || 'Ошибка удаления'); 
      }
    }
  }, [dispatch]);

  const handleFormSubmit = useCallback(() => {
    setShowForm(false);
    setEditingEmployee(null);
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleEdit = useCallback((employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingEmployee(null);
    setShowForm(true);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingEmployee(null);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Функция для сброса фильтров
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterActive('all');
  }, []);

  // Компонент строки таблицы вынесен для производительности (опционально)
  const EmployeeRow = useCallback(({ employee, index }) => (
    <tr 
      style={{
        borderBottom: '1px solid #f3f4f6',
        background: index % 2 === 0 ? '#fff' : '#fafafa',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
      onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#fafafa'}
    >
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={employee.full_name} />
          <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
            {employee.full_name || '—'}
          </span>
        </div>
      </td>
      <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151' }}>
        {employee.position || '—'}
      </td>
      <td style={{ padding: '14px 20px', fontSize: 14, color: '#6b7280' }}>
        {employee.department_name || '—'}
      </td>
      <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151', fontFamily: 'monospace' }}>
        {employee.phone || '—'}
      </td>
      <td style={{ padding: '14px 20px' }}>
        <span style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: employee.is_active ? '#d1fae5' : '#fee2e2',
          color: employee.is_active ? '#065f46' : '#991b1b',
        }}>
          {employee.is_active ? 'Активен' : 'Неактивен'}
        </span>
      </td>
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleEdit(employee)} 
            style={{
              background: '#eff6ff', color: '#2563eb', border: 'none',
              borderRadius: 8, padding: '6px 12px', fontSize: 13, 
              cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#dbeafe';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#eff6ff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            aria-label={`Редактировать сотрудника ${employee.full_name}`}
          >
            ✏️ Изменить
          </button>
          <button 
            onClick={() => handleDelete(employee.id, employee.full_name)} 
            style={{
              background: '#fef2f2', color: '#dc2626', border: 'none',
              borderRadius: 8, padding: '6px 12px', fontSize: 13, 
              cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            aria-label={`Удалить сотрудника ${employee.full_name}`}
          >
            🗑️ Удалить
          </button>
        </div>
      </td>
    </tr>
  ), [handleEdit, handleDelete]);

  // Состояние загрузки
  if (loading && employees.length === 0) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        minHeight: '400px', fontFamily: "'Geologica', 'Segoe UI', sans-serif" 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Загрузка списка сотрудников...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Geologica', 'Segoe UI', sans-serif" }}>
      {/* Заголовок */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>
            Сотрудники
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Всего: {stats.total} · Активных: {stats.active} · Неактивных: {stats.inactive}
          </p>
        </div>
        <button 
          onClick={handleAddNew} 
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 20px', fontWeight: 600, fontSize: 14,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)';
          }}
        >
          + Добавить сотрудника
        </button>
      </div>

      {/* Фильтры и поиск */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 20, 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{ 
            position: 'absolute', left: 14, top: '50%', 
            transform: 'translateY(-50%)', fontSize: 16, 
            pointerEvents: 'none'
          }}>🔍</span>
          <input
            type="text"
            placeholder="Поиск по имени, должности или отделу..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: '1.5px solid #e5e7eb', borderRadius: 10,
              padding: '10px 14px 10px 40px', fontSize: 14,
              outline: 'none', fontFamily: 'inherit', color: '#111827',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            aria-label="Поиск сотрудников"
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: 4, 
          background: '#f3f4f6', 
          borderRadius: 10, 
          padding: 4,
          flexWrap: 'wrap'
        }}>
          {[
            ['all', 'Все', stats.total],
            ['active', 'Активные', stats.active],
            ['inactive', 'Неактивные', stats.inactive]
          ].map(([val, label, count]) => (
            <button 
              key={val} 
              onClick={() => setFilterActive(val)} 
              style={{
                padding: '7px 14px', borderRadius: 7, border: 'none', fontSize: 13,
                fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                background: filterActive === val ? '#fff' : 'transparent',
                color: filterActive === val ? '#111827' : '#6b7280',
                boxShadow: filterActive === val ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
              aria-pressed={filterActive === val}
              aria-label={`Показать ${label.toLowerCase()} (${count})`}
            >
              {label} <span style={{ fontSize: 11, opacity: 0.7 }}>({count})</span>
            </button>
          ))}
        </div>

        {(searchTerm || filterActive !== 'all') && (
          <button
            onClick={resetFilters}
            style={{
              padding: '7px 14px', borderRadius: 7, border: '1px solid #e5e7eb',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              background: '#fff', color: '#6b7280',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
            aria-label="Сбросить фильтры"
          >
            ✕ Сбросить фильтры
          </button>
        )}
      </div>

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div style={{ marginBottom: 20 }}>
          <EmployeeForm 
            employee={editingEmployee} 
            onSubmit={handleFormSubmit} 
            onCancel={handleCancelForm} 
          />
        </div>
      )}

      {/* Таблица сотрудников */}
      <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        overflow: 'auto', border: '1px solid #e5e7eb',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Сотрудник', 'Должность', 'Отдел', 'Телефон', 'Статус', 'Действия'].map((h, idx) => (
                <th key={h} style={{
                  padding: '13px 20px', textAlign: 'left', fontSize: 11,
                  fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
                  letterSpacing: '0.05em', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && employees.length > 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
                    <span>🔄</span>
                    <span style={{ color: '#6b7280', fontSize: 14 }}>Обновление данных...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                    {searchTerm || filterActive !== 'all' ? 'Сотрудники не найдены' : 'Нет сотрудников'}
                  </p>
                  {(searchTerm || filterActive !== 'all') && (
                    <button
                      onClick={resetFilters}
                      style={{
                        marginTop: 16, padding: '6px 12px', fontSize: 13,
                        border: '1px solid #e5e7eb', borderRadius: 8,
                        background: '#fff', color: '#6b7280', cursor: 'pointer',
                      }}
                    >
                      Сбросить фильтры
                    </button>
                  )}
                  {!searchTerm && filterActive === 'all' && employees.length === 0 && (
                    <button
                      onClick={handleAddNew}
                      style={{
                        marginTop: 16, padding: '8px 16px', fontSize: 13,
                        background: '#2563eb', color: '#fff', border: 'none',
                        borderRadius: 8, cursor: 'pointer',
                      }}
                    >
                      + Добавить первого сотрудника
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((employee, index) => (
                <EmployeeRow key={employee.id} employee={employee} index={index} />
              ))
            )}
          </tbody>
        </table>
        
        {/* Информация о количестве записей */}
        {filtered.length > 0 && (
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
            gap: 8,
          }}>
            <span>Показано: {filtered.length} из {employees.length} сотрудников</span>
            <div style={{ display: 'flex', gap: 16 }}>
              {searchTerm && (
                <span style={{ fontSize: 11 }}>
                  🔍 Поиск: "{searchTerm}"
                </span>
              )}
              {filterActive !== 'all' && (
                <span style={{ fontSize: 11 }}>
                  ⚡ Фильтр: {filterActive === 'active' ? 'Активные' : 'Неактивные'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;