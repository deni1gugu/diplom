import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { path: '/', label: 'Дашборд', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1', always: true },
    { path: '/schedule', label: 'Расписание', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', always: true },
    { path: '/time-tracking', label: 'Учёт времени', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', always: true },
    { path: '/employees', label: 'Сотрудники', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', adminOnly: true },
    { path: '/reports', label: 'Отчёты', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', adminOnly: true },
  ];

  const filteredItems = menuItems.filter((item) => item.always || (item.adminOnly && isAdmin));

  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl z-50">
      {/* Логотип */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">WorkTime</h1>
            <p className="text-xs text-slate-400">Образовательное учреждение</p>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Меню</p>
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Профиль */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 bg-white/5 rounded-xl p-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
            {user?.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || 'Неизвестно'}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role === 'admin' ? 'Администратор' : 'Сотрудник'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;