import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../../store/authSlice';

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '12px 16px',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  color: '#fff',
  background: 'rgba(255,255,255,0.05)',
  transition: 'all 0.15s',
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(login({ username, password }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      position: 'relative',
      fontFamily: "'Geologica', 'Segoe UI', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Декоративные круги */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: 80,
        width: 288,
        height: 288,
        background: 'rgba(59,130,246,0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 80,
        right: 80,
        width: 384,
        height: 384,
        background: 'rgba(6,182,212,0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      {/* Карточка входа */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 448,
        zIndex: 10,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          borderRadius: 24,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          
          {/* Логотип */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 10px 25px -5px rgba(59,130,246,0.3)',
            }}>
              <svg style={{ width: 32, height: 32, color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fff' }}>
              Вход в систему
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#94a3b8' }}>
              Учёт рабочего времени
            </p>
          </div>

          {/* Ошибка */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: 12,
              marginBottom: 16,
              fontSize: 14,
              backdropFilter: 'blur(4px)',
            }}>
              {error}
            </div>
          )}

          {/* Форма */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#cbd5e1',
                marginBottom: 6,
              }}>
                Логин
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                required
                placeholder="Введите логин"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#cbd5e1',
                marginBottom: 6,
              }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                required
                placeholder="Введите пароль"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading 
                  ? 'rgba(59,130,246,0.5)' 
                  : 'linear-gradient(135deg, #2563eb, #06b6d4)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(59,130,246,0.3)',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(59,130,246,0.4)';
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(59,130,246,0.3)';
                }
              }}
            >
              {loading ? '⏳ Вход...' : '🚀 Войти'}
            </button>
          </form>

          {/* Демо-доступ */}
          <div style={{
            marginTop: 24,
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <p style={{
              fontSize: 11,
              color: '#94a3b8',
              textAlign: 'center',
              margin: '0 0 8px 0',
            }}>
              Демо-доступ
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              textAlign: 'center',
              fontSize: 12,
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: '8px',
              }}>
                <p style={{ margin: 0, color: '#cbd5e1', fontWeight: 500 }}>admin</p>
                <p style={{ margin: '4px 0 0', color: '#64748b' }}>admin123</p>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: '8px',
              }}>
                <p style={{ margin: 0, color: '#cbd5e1', fontWeight: 500 }}>user</p>
                <p style={{ margin: '4px 0 0', color: '#64748b' }}>user123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;