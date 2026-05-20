import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createEmployee, updateEmployee } from '../../store/employeeSlice';

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    full_name: '', position: '', department: '', phone: '', email: '',
    role: 'employee', username: '', password: '',
  });

  useEffect(() => {
    if (employee) {
      setForm({
        full_name: employee.full_name || '',
        position: employee.position || '',
        department: employee.department || '',
        phone: employee.phone || '',
        email: employee.email || '',
        role: employee.role || 'employee',
        username: '',
        password: '',
      });
    }
  }, [employee]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (employee) {
        await dispatch(updateEmployee({ id: employee.id, ...form })).unwrap();
        toast.success('Данные обновлены');
      } else {
        await dispatch(createEmployee(form)).unwrap();
        toast.success('Сотрудник добавлен');
      }
      onSubmit();
    } catch (err) { toast.error('Ошибка сохранения'); }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">{employee ? 'Редактирование' : 'Новый сотрудник'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!employee && (
          <div className="grid grid-cols-2 gap-4">
            <input name="username" placeholder="Логин" value={form.username} onChange={handleChange} className="border rounded px-3 py-2" required />
            <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} className="border rounded px-3 py-2" required />
          </div>
        )}
        <input name="full_name" placeholder="ФИО" value={form.full_name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        <div className="grid grid-cols-2 gap-4">
          <input name="position" placeholder="Должность" value={form.position} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="phone" placeholder="Телефон" value={form.phone} onChange={handleChange} className="border rounded px-3 py-2" />
        </div>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2">
          <option value="employee">Сотрудник</option>
          <option value="admin">Администратор</option>
        </select>
        <div className="flex space-x-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{employee ? 'Сохранить' : 'Добавить'}</button>
          <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">Отмена</button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;