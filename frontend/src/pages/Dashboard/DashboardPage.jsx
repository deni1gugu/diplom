import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const StatCard = ({ label, value, icon, accent }) => (
  <div style={{
    background: '#fff',
    borderRadius: 16,
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    borderLeft: `4px solid ${accent}`,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: accent + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: 13, color: '#6b7280', margin: 0, fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2 }}>{value}</p>
    </div>
  </div>
);

const QuickLink = ({ to, icon, label, color }) => (
  <Link to={to} style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    padding: '20px 12px',
    background: color + '0f',
    border: `1.5px solid ${color}22`,
    borderRadius: 14,
    textDecoration: 'none',
    transition: 'all 0.18s ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = color + '1a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`; }}
    onMouseLeave={e => { e.currentTarget.style.background = color + '0f'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <span style={{ fontSize: 28 }}>{icon}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
  </Link>
);

const statusStyle = (status) => ({
  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
  ...(status === 'completed'
    ? { background: '#d1fae5', color: '#065f46' }
    : { background: '#dbeafe', color: '#1e40af' })
});

const DashboardPage = () => {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState({ total_employees: 0, today_shifts: 0, weekly_late_count: 0, avg_working_hours: 0 });
  const [todayShifts, setTodayShifts] = useState([]);

  useEffect(() => {
    if (isAdmin) api.get('/time-records/statistics/').then(r => setStats(r.data)).catch(() => {});
    api.get('/shifts/today/').then(r => setTodayShifts(r.data || [])).catch(() => {});
  }, [isAdmin]);

  const dateStr = new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ fontFamily: "'Geologica', 'Segoe UI', sans-serif" }}>
      {/* Шапка */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        borderRadius: 20, padding: '32px 36px', marginBottom: 28,
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', right: 60, bottom: -40, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
        }} />
        <p style={{ margin: '0 0 4px', fontSize: 13, color: 'rgba(255,255,255,0.65)', textTransform: 'capitalize' }}>{dateStr}</p>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
          Добро пожаловать, {user?.full_name?.split(' ')[0] || 'Пользователь'} 👋
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
          {user?.role === 'admin' ? 'Панель администратора' : 'Личный кабинет сотрудника'}
        </p>
      </div>

      {/* Статистика (только для админа) */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Сотрудников" value={stats.total_employees} icon="👥" accent="#2563eb" />
          <StatCard label="Смен сегодня" value={stats.today_shifts} icon="📅" accent="#10b981" />
          <StatCard label="Опозданий за неделю" value={stats.weekly_late_count} icon="⚠️" accent="#ef4444" />
          <StatCard label="Среднее время (ч)" value={`${stats.avg_working_hours} ч`} icon="⏱️" accent="#8b5cf6" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Смены на сегодня */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>📅 Смены на сегодня</h2>
            <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>
              {todayShifts.length} смен
            </span>
          </div>
          {todayShifts.length === 0
            ? <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🌙</div>
                <p style={{ margin: 0, fontSize: 14 }}>Смен нет</p>
              </div>
            : todayShifts.map(s => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: '#f9fafb', borderRadius: 10, marginBottom: 8,
                border: '1px solid #f3f4f6',
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#111827' }}>{s.employee_name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{s.start_time} — {s.end_time}</p>
                </div>
                <span style={statusStyle(s.status)}>{s.status === 'completed' ? 'Завершена' : 'Запланирована'}</span>
              </div>
            ))
          }
        </div>

        {/* Быстрые действия */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: '#111827' }}>⚡ Быстрые действия</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <QuickLink to="/time-tracking" icon="⏰" label="Отметиться" color="#2563eb" />
            <QuickLink to="/schedule" icon="📅" label="Расписание" color="#10b981" />
            {isAdmin && <>
              <QuickLink to="/employees" icon="👥" label="Сотрудники" color="#8b5cf6" />
              <QuickLink to="/reports" icon="📊" label="Отчёты" color="#f59e0b" />
            </>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;