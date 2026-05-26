import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createEmployee, updateEmployee } from '../../store/employeeSlice';
import api from '../../api/axios';

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #e5e7eb', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, outline: 'none',
  fontFamily: 'inherit', color: '#111827', background: '#fff',
};

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    full_name: '', position: '', department: '', phone: '', email: '',
    role: 'employee', username: '', password: '',
  });

  // Загружаем список отделов
  useEffect(() => {
    api.get('/departments/').then(r => setDepartments(r.data.results || r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (employee) {
      setForm({
        full_name: employee.full_name || '',
        position: employee.position || '',
        department: employee.department || '',  // здесь уже должен быть ID
        phone: employee.phone || '',
        email: employee.email || '',
        role: employee.role || 'employee',
        username: '',
        password: '',
      });
    } else {
      setForm({
        full_name: '', position: '', department: '', phone: '', email: '',
        role: 'employee', username: '', password: '',
      });
    }
  }, [employee]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.position) {
      toast.error('Заполните обязательные поля (ФИО, должность)');
      return;
    }
    if (!employee && (!form.username || !form.password)) {
      toast.error('Для нового сотрудника укажите логин и пароль');
      return;
    }

    setLoading(true);
    try {
      if (employee) {
        const { username, password, ...updateData } = form;

        // ИСПРАВЛЕНО: добавляем user_id который требует сервер
        const payload = {
          ...updateData,
          user_id: employee.user || employee.user_id,
          // ИСПРАВЛЕНО: department как число (ID), не строка
          department: updateData.department ? Number(updateData.department) : null,
        };

        await dispatch(updateEmployee({ id: employee.id, ...payload })).unwrap();
        toast.success('Данные сотрудника обновлены');
      } else {
        const payload = {
          ...form,
          department: form.department ? Number(form.department) : null,
        };
        await dispatch(createEmployee(payload)).unwrap();
        toast.success('Сотрудник успешно добавлен');
      }
      onSubmit();
    } catch (err) {
      const serverError = err?.user_id?.[0] || err?.department?.[0] ||
        err?.detail || err?.message || 'Ошибка сохранения';
      toast.error(serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 24,
      border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: 24,
    }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#111827' }}>
        {employee ? '✏️ Редактирование сотрудника' : '➕ Новый сотрудник'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: 14 }}>

          {!employee && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                  Логин <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input name="username" placeholder="username" value={form.username}
                  onChange={handleChange} style={inputStyle} required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                  Пароль <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input name="password" type="password" placeholder="••••••••" value={form.password}
                  onChange={handleChange} style={inputStyle} required />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
              ФИО <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input name="full_name" placeholder="Иванов Иван Иванович" value={form.full_name}
              onChange={handleChange} style={inputStyle} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                Должность <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input name="position" placeholder="Менеджер" value={form.position}
                onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                Отдел
              </label>
              {/* ИСПРАВЛЕНО: выпадающий список отделов с ID */}
              <select name="department" value={form.department} onChange={handleChange}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">— Без отдела —</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Телефон</label>
              <input name="phone" placeholder="+7 999 000 00 00" value={form.phone}
                onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Email</label>
              <input name="email" type="email" placeholder="ivan@example.com" value={form.email}
                onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Роль</label>
            <select name="role" value={form.role} onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="employee">👤 Сотрудник</option>
              <option value="admin">👑 Администратор</option>
            </select>
          </div>

        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button type="submit" disabled={loading} style={{
            background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 24px', fontWeight: 600, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            {loading ? '⏳ Сохранение...' : (employee ? '💾 Сохранить' : '➕ Добавить')}
          </button>
          <button type="button" onClick={onCancel} disabled={loading} style={{
            background: '#f3f4f6', color: '#374151', border: 'none',
            borderRadius: 10, padding: '10px 24px', fontWeight: 600, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;