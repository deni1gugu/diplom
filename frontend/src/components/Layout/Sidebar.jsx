import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = ({ isMobile = false, onClose = () => {} }) => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { 
      path: '/', 
      label: 'Дашборд', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1', 
      always: true 
    },
    { 
      path: '/schedule', 
      label: 'Расписание', 
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
      always: true 
    },
    { 
      path: '/time-tracking', 
      label: 'Учёт времени', 
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 
      always: true 
    },
    { 
      path: '/employees', 
      label: 'Сотрудники', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197', 
      adminOnly: true 
    },
    { 
      path: '/reports', 
      label: 'Отчёты', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 
      adminOnly: true 
    },
  ];

  // ВАЖНО: фильтруем пункты меню на основе роли
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.always) return true;
      if (item.adminOnly && isAdmin) return true;
      return false;
    });
  }, [isAdmin]);

  const getUserInitials = useMemo(() => {
    if (!user?.full_name) return '?';
    const nameParts = user.full_name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }, [user?.full_name]);

  const getUserName = useMemo(() => {
    if (!user?.full_name) return 'Неизвестно';
    if (user.full_name.length > 20) {
      return user.full_name.substring(0, 18) + '...';
    }
    return user.full_name;
  }, [user?.full_name]);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      style={{
        position: isMobile ? 'fixed' : 'relative',
        left: 0,
        top: 0,
        height: '100vh',
        width: 260,
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        zIndex: 50,
      }}
      aria-label="Боковое меню навигации"
    >
      {/* Логотип */}
      <div 
        style={{ 
          padding: '24px 20px', 
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer',
        }}
        onClick={handleLinkClick}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
            }}
          >
            <svg
              style={{ width: 22, height: 22 }}
              fill="none"
              stroke="white"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
              WorkTime
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
              Учёт рабочего времени
            </p>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto', overflowX: 'hidden' }}>
        <p style={{
          margin: '0 0 12px 12px',
          fontSize: 10,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Меню
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredItems.map((item) => (
            <li key={item.path} style={{ marginBottom: 4 }}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={handleLinkClick}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  background: isActive
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  boxShadow: isActive
                    ? '0 4px 12px rgba(37,99,235,0.35)'
                    : 'none',
                })}
              >
                <svg
                  style={{ width: 20, height: 20, flexShrink: 0 }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Профиль пользователя */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: '10px 12px',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              flexShrink: 0,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              color: '#fff',
              boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
            }}
          >
            {getUserInitials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#fff',
              }}
              title={user?.full_name}
            >
              {getUserName}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
              {user?.role === 'admin' ? 'Администратор' : 'Сотрудник'}
            </p>
          </div>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 0 2px rgba(16,185,129,0.2)',
            }}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;