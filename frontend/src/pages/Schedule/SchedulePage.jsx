import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchShifts, createShift, updateShift, deleteShift } from '../../store/shiftSlice';
import { fetchEmployees } from '../../store/employeeSlice';

const SchedulePage = () => {
  const dispatch = useDispatch();
  const { items: shifts, loading } = useSelector((state) => state.shifts);
  const { items: employees } = useSelector((state) => state.employees);
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [form, setForm] = useState({ employee: '', date: '', start_time: '', end_time: '', note: '' });

  useEffect(() => {
    dispatch(fetchShifts());
    if (isAdmin) dispatch(fetchEmployees());
  }, [dispatch, isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShift) {
        await dispatch(updateShift({ id: editingShift.id, ...form })).unwrap();
        toast.success('Смена обновлена');
      } else {
        await dispatch(createShift(form)).unwrap();
        toast.success('Смена создана');
      }
      setShowForm(false);
      setEditingShift(null);
      setForm({ employee: '', date: '', start_time: '', end_time: '', note: '' });
    } catch (err) { toast.error('Ошибка сохранения'); }
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setForm({ employee: shift.employee, date: shift.date, start_time: shift.start_time, end_time: shift.end_time, note: shift.note || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить смену?')) {
      try { await dispatch(deleteShift(id)).unwrap(); toast.success('Смена удалена'); }
      catch { toast.error('Ошибка удаления'); }
    }
  };

  const statusBadge = (s) => {
    const colors = { planned: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
    const labels = { planned: 'Запланирована', completed: 'Завершена', cancelled: 'Отменена' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[s] || ''}`}>{labels[s] || s}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Расписание</h1>
        {isAdmin && <button onClick={() => { setEditingShift(null); setForm({ employee: '', date: '', start_time: '', end_time: '', note: '' }); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Новая смена</button>}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">{editingShift ? 'Редактирование' : 'Новая смена'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAdmin && (
              <select name="employee" value={form.employee} onChange={e => setForm({...form, employee: e.target.value})} className="w-full border rounded px-3 py-2" required>
                <option value="">Выберите сотрудника</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
            )}
            <div className="grid grid-cols-3 gap-4">
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="border rounded px-3 py-2" required />
              <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="border rounded px-3 py-2" required />
              <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="border rounded px-3 py-2" required />
            </div>
            <textarea placeholder="Примечание" value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="w-full border rounded px-3 py-2" rows="2" />
            <div className="flex space-x-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editingShift ? 'Сохранить' : 'Создать'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 px-4 py-2 rounded">Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сотрудник</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Время</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? <tr><td colSpan={5} className="px-6 py-4 text-center">Загрузка...</td></tr> :
            shifts.length === 0 ? <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Нет данных</td></tr> :
            shifts.map(s => (
              <tr key={s.id}>
                <td className="px-6 py-4">{s.employee_name}</td>
                <td className="px-6 py-4">{s.date}</td>
                <td className="px-6 py-4">{s.start_time} - {s.end_time}</td>
                <td className="px-6 py-4">{statusBadge(s.status)}</td>
                {isAdmin && <td className="px-6 py-4">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 mr-3">✏️</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600">🗑️</button>
                </td>}
              </tr>
            ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchedulePage;