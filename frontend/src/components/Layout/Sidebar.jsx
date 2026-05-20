import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { path: '/', label: 'Дашборд', icon: '📊', always: true },
    { path: '/schedule', label: 'Расписание', icon: '📅', always: true },
    { path: '/time-tracking', label: 'Учёт времени', icon: '⏱️', always: true },
    { path: '/employees', label: 'Сотрудники', icon: '👥', adminOnly: true },
    { path: '/reports', label: 'Отчёты', icon: '📈', adminOnly: true },
  ];

  const filteredItems = menuItems.filter(
    (item) => item.always || (item.adminOnly && isAdmin)
  );

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Учёт рабочего времени</h1>
        <p className="text-sm text-gray-400 mt-1">Образовательное учреждение</p>
      </div>

      <nav className="space-y-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
            end={item.path === '/'}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-400">Пользователь</p>
          <p className="font-medium">{user?.full_name || 'Неизвестно'}</p>
          <p className="text-xs text-gray-500 capitalize">
            {user?.role === 'admin' ? 'Администратор' : 'Сотрудник'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;