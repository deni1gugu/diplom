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
  transition: 'border-color 0.15s',
};

// Функция для форматирования телефона только с +7
const formatPhoneNumber = (value) => {
  // Удаляем все нецифровые символы
  let cleaned = value.replace(/\D/g, '');
  
  // Если номер начинается с 8, заменяем на 7
  if (cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.slice(1);
  }
  
  // Если номер начинается с 9 (без кода страны), добавляем 7
  if (cleaned.length === 10 && cleaned.startsWith('9')) {
    cleaned = '7' + cleaned;
  }
  
  // Ограничиваем 11 цифрами (код страны 7 + 10 цифр)
  const match = cleaned.match(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
  
  if (!match) return '';
  
  let result = '+7';
  if (match[2]) result += ` (${match[2]}`;
  if (match[3]) result += `) ${match[3]}`;
  if (match[4]) result += `-${match[4]}`;
  if (match[5]) result += `-${match[5]}`;
  
  return result;
};

// Валидация телефона - проверяем что номер начинается с +7 и содержит 11 цифр
const validatePhone = (phone) => {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, '');
  // Должно быть 11 цифр и первая цифра должна быть 7
  return digits.length === 11 && digits.startsWith('7');
};

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isNewDepartment, setIsNewDepartment] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [form, setForm] = useState({
    full_name: '', position: '', department: '', phone: '', email: '',
    role: 'employee', username: '', password: '',
  });

  // Загружаем список отделов
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments/');
        setDepartments(response.data.results || response.data || []);
      } catch (error) {
        console.error('Ошибка загрузки отделов:', error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (employee) {
      setForm({
        full_name: employee.full_name || '',
        position: employee.position || '',
        department: employee.department?.id || employee.department || '',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Специальная обработка для телефона
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setForm({ ...form, [name]: formattedPhone });
      
      // Валидация
      if (value && !validatePhone(formattedPhone)) {
        setPhoneError('Номер должен начинаться с +7 и содержать 10 цифр после кода');
      } else {
        setPhoneError('');
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Создание нового отдела
  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) {
      toast.error('Введите название отдела');
      return;
    }

    try {
      const response = await api.post('/departments/', { name: newDepartmentName });
      const newDepartment = response.data;
      setDepartments([...departments, newDepartment]);
      setForm({ ...form, department: newDepartment.id });
      setIsNewDepartment(false);
      setNewDepartmentName('');
      toast.success(`Отдел "${newDepartmentName}" создан`);
    } catch (error) {
      toast.error('Ошибка создания отдела');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.full_name.trim()) {
      toast.error('Введите ФИО сотрудника');
      return;
    }
    if (!form.position.trim()) {
      toast.error('Введите должность');
      return;
    }
    if (!employee && (!form.username.trim() || !form.password)) {
      toast.error('Для нового сотрудника укажите логин и пароль');
      return;
    }
    
    // Валидация телефона перед отправкой
    if (form.phone && !validatePhone(form.phone)) {
      toast.error('Некорректный формат телефона. Используйте формат: +7 (999) 123-45-67');
      return;
    }

    setLoading(true);
    try {
      if (employee) {
        const { username, password, ...updateData } = form;
        const payload = {
          ...updateData,
          user_id: employee.user_id || employee.user?.id || employee.user,
          department: updateData.department ? Number(updateData.department) : null,
        };
        
        Object.keys(payload).forEach(key => {
          if (payload[key] === undefined) delete payload[key];
        });
        
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
      let errorMessage = 'Ошибка сохранения';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.user_id?.[0]) {
        errorMessage = `Ошибка с пользователем: ${err.user_id[0]}`;
      } else if (err?.department?.[0]) {
        errorMessage = `Ошибка с отделом: ${err.department[0]}`;
      } else if (err?.detail) {
        errorMessage = err.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 24,
      border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', 
      marginBottom: 24,
    }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#111827' }}>
        {employee ? '✏️ Редактирование сотрудника' : '➕ Новый сотрудник'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: 14 }}>

          {/* Логин и пароль - только для нового сотрудника */}
          {!employee && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                  Логин <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  name="username" 
                  placeholder="username" 
                  value={form.username}
                  onChange={handleChange} 
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  required 
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                  Пароль <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={form.password}
                  onChange={handleChange} 
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  required 
                />
              </div>
            </div>
          )}

          {/* ФИО */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
              ФИО <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              name="full_name" 
              placeholder="Иванов Иван Иванович" 
              value={form.full_name}
              onChange={handleChange} 
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              required 
            />
          </div>

          {/* Должность */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
              Должность <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              name="position" 
              placeholder="Менеджер" 
              value={form.position}
              onChange={handleChange} 
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              required 
            />
          </div>

          {/* Отдел */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
              Отдел
            </label>
            
            {!isNewDepartment ? (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    style={{ ...inputStyle, cursor: 'pointer', flex: 1 }}
                  >
                    <option value="">— Без отдела —</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsNewDepartment(true)}
                    style={{
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 10,
                      border: '1.5px dashed #2563eb',
                      background: '#eff6ff',
                      color: '#2563eb',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#dbeafe';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#eff6ff';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    + Новый отдел
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ marginBottom: 8 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500, color: '#374151' }}>
                    Создать новый отдел:
                  </p>
                  <input
                    type="text"
                    placeholder="Введите название отдела"
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
                    style={inputStyle}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleCreateDepartment}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    ✅ Создать
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewDepartment(false);
                      setNewDepartmentName('');
                    }}
                    style={{
                      flex: 1,
                      background: '#f3f4f6',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Телефон - только с +7 */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
              Телефон <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 400 }}>(только +7)</span>
            </label>
            <input 
              name="phone" 
              placeholder="+7 (___) ___-__-__" 
              value={form.phone}
              onChange={handleChange} 
              style={{
                ...inputStyle,
                borderColor: phoneError ? '#ef4444' : '#e5e7eb',
                fontFamily: 'monospace',
                letterSpacing: '0.5px',
              }}
              onFocus={e => e.currentTarget.style.borderColor = phoneError ? '#ef4444' : '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = phoneError ? '#ef4444' : '#e5e7eb'}
            />
            {phoneError && (
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444' }}>
                ⚠️ {phoneError}
              </p>
            )}
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>
              📞 Формат: +7 (XXX) XXX-XX-XX (только российские номера)
            </p>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
              Email
            </label>
            <input 
              name="email" 
              type="email" 
              placeholder="example@company.com" 
              value={form.email}
              onChange={handleChange} 
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Роль */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
              Роль
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="employee">👤 Сотрудник</option>
              <option value="admin">👑 Администратор</option>
            </select>
          </div>

        </div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button 
            type="submit" 
            disabled={loading} 
            style={{
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 24px', fontWeight: 600, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? '⏳ Сохранение...' : (employee ? '💾 Сохранить' : '➕ Добавить')}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={loading}
            style={{
              background: '#f3f4f6', color: '#374151', border: 'none',
              borderRadius: 10, padding: '10px 24px', fontWeight: 600, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.background = '#e5e7eb';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.currentTarget.style.background = '#f3f4f6';
              }
            }}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;