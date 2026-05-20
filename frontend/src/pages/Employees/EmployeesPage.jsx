import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchEmployees, deleteEmployee } from '../../store/employeeSlice';
import EmployeeForm from './EmployeeForm';

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const { items: employees, loading } = useSelector((state) => state.employees);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { dispatch(fetchEmployees()); }, [dispatch]);

  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Удалить сотрудника?')) {
      try { await dispatch(deleteEmployee(id)).unwrap(); toast.success('Сотрудник удалён'); }
      catch { toast.error('Ошибка удаления'); }
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingEmployee(null);
    dispatch(fetchEmployees());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
        <button onClick={() => { setEditingEmployee(null); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Добавить сотрудника</button>
      </div>

      <input type="text" placeholder="Поиск по имени или должности..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border rounded px-3 py-2" />

      {showForm && <EmployeeForm employee={editingEmployee} onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Должность</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? <tr><td colSpan={5} className="px-6 py-4 text-center">Загрузка...</td></tr> :
            filtered.length === 0 ? <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Нет данных</td></tr> :
            filtered.map(e => (
              <tr key={e.id}>
                <td className="px-6 py-4 font-medium">{e.full_name}</td>
                <td className="px-6 py-4 text-gray-600">{e.position}</td>
                <td className="px-6 py-4 text-gray-600">{e.phone || '-'}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${e.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{e.is_active ? 'Активен' : 'Неактивен'}</span></td>
                <td className="px-6 py-4">
                  <button onClick={() => { setEditingEmployee(e); setShowForm(true); }} className="text-blue-600 mr-3">✏️</button>
                  <button onClick={() => handleDelete(e.id)} className="text-red-600">🗑️</button>
                </td>
              </tr>
            ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesPage;