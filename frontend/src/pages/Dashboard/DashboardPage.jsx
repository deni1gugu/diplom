import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const DashboardPage = () => {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState({ total_employees: 0, today_shifts: 0, weekly_late_count: 0, avg_working_hours: 0 });
  const [todayShifts, setTodayShifts] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/time-records/statistics/').then(r => setStats(r.data)).catch(() => {});
    }
    api.get('/shifts/today/').then(r => setTodayShifts(r.data || [])).catch(() => {});
  }, [isAdmin]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Добро пожаловать, {user?.full_name || 'Пользователь'}</h1>
        <p className="text-gray-600 mt-1">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Сотрудников', value: stats.total_employees, icon: '👥', color: 'blue' },
            { label: 'Смен сегодня', value: stats.today_shifts, icon: '📅', color: 'green' },
            { label: 'Опозданий за неделю', value: stats.weekly_late_count, icon: '⚠️', color: 'red' },
            { label: 'Среднее время', value: `${stats.avg_working_hours} ч`, icon: '⏱️', color: 'purple' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <span className="text-2xl">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Смены на сегодня</h2>
          {todayShifts.length === 0 ? <p className="text-gray-500">Нет смен</p> : todayShifts.map(s => (
            <div key={s.id} className="flex justify-between p-3 bg-gray-50 rounded-lg mb-2">
              <div><p className="font-medium">{s.employee_name}</p><p className="text-sm text-gray-600">{s.start_time} - {s.end_time}</p></div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {s.status === 'completed' ? 'Завершена' : 'Запланирована'}
              </span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { to: '/time-tracking', icon: '⏰', label: 'Отметиться' },
              { to: '/schedule', icon: '📅', label: 'Расписание' },
              ...(isAdmin ? [{ to: '/employees', icon: '👥', label: 'Сотрудники' }, { to: '/reports', icon: '📊', label: 'Отчёты' }] : []),
            ].map((a, i) => (
              <Link key={i} to={a.to} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                <span className="text-3xl mb-2">{a.icon}</span>
                <span className="text-sm font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;