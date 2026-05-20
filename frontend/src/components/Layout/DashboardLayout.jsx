import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import { logout } from '../../store/authSlice';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Система учёта рабочего времени
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.full_name}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">
                {user?.role === 'admin' ? 'Администратор' : 'Сотрудник'}
              </span>
              <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">
                Выйти
              </button>
            </div>
          </div>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;