import React, { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import { logout } from '../../store/authSlice';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = useCallback(() => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      dispatch(logout());
      navigate('/login');
      toast.success('Вы вышли из системы');
    }
  }, [dispatch, navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />
      
      <div style={{ 
        marginLeft: 260, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0 
      }}>
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#374151' }}>
            Система учёта рабочего времени
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: '#374151' }}>
              {user?.full_name || 'Пользователь'}
            </span>
            <span style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: user?.role === 'admin' ? '#dbeafe' : '#d1fae5',
              color: user?.role === 'admin' ? '#1e40af' : '#065f46',
            }}>
              {user?.role === 'admin' ? 'Администратор' : 'Сотрудник'}
            </span>
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              Выйти
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;