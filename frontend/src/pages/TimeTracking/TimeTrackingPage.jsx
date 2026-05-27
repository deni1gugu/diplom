import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const TimeTrackingPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [todayStatus, setTodayStatus] = useState([]);
  const [checking, setChecking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Обновление времени каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { 
    loadStatus(); 
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.get('/time-records/today_status/');
      setTodayStatus(res.data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  };

  const handleCheckIn = async (shiftId) => {
    setChecking(true);
    try {
      await api.post('/time-records/check_in/', { shift_id: shiftId });
      toast.success('✅ Приход отмечен! Хорошего рабочего дня!');
      loadStatus();
    } catch (err) { 
      toast.error(err.response?.data?.error || '❌ Ошибка отметки прихода'); 
    }
    setChecking(false);
  };

  const handleCheckOut = async (shiftId) => {
    setChecking(true);
    try {
      await api.post('/time-records/check_out/', { shift_id: shiftId });
      toast.success('🏠 Уход отмечен! Отдыхайте!');
      loadStatus();
    } catch (err) { 
      toast.error(err.response?.data?.error || '❌ Ошибка отметки ухода'); 
    }
    setChecking(false);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    if (status.checked_in && status.checked_out) return '#10b981';
    if (status.checked_in && !status.checked_out) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusText = (status) => {
    if (status.checked_in && status.checked_out) return 'Завершено';
    if (status.checked_in && !status.checked_out) return 'В процессе';
    return 'Не начата';
  };

  const getStatusIcon = (status) => {
    if (status.checked_in && status.checked_out) return '✅';
    if (status.checked_in && !status.checked_out) return '⏳';
    return '⭕';
  };

  return (
    <div style={{ fontFamily: "'Geologica', 'Segoe UI', sans-serif" }}>
      {/* Заголовок */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>
          Учёт рабочего времени
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
          {user?.full_name || 'Сотрудник'}, отмечайте приход и уход
        </p>
      </div>

      {/* Текущая дата и время */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        color: '#fff',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
          {formatDate(currentTime)}
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 700, letterSpacing: '2px' }}>
          {currentTime.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      </div>

      {/* Список смен */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 20 
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
            📅 Смены на сегодня
          </h2>
          <span style={{
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: '#f3f4f6',
            color: '#6b7280',
          }}>
            {todayStatus.length} смен
          </span>
        </div>

        {todayStatus.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#9ca3af',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ margin: 0, fontSize: 14 }}>На сегодня нет смен</p>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>Обратитесь к администратору</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {todayStatus.map((shift) => (
              <div
                key={shift.shift_id}
                style={{
                  background: '#f9fafb',
                  borderRadius: 12,
                  border: `2px solid ${getStatusColor(shift)}20`,
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}>
                  {/* Левая часть - информация о смене */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        background: getStatusColor(shift) + '20',
                        color: getStatusColor(shift),
                      }}>
                        {getStatusIcon(shift)} {getStatusText(shift)}
                      </span>
                      {shift.is_late && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 600,
                          background: '#fee2e2',
                          color: '#dc2626',
                        }}>
                          ⚠️ Опоздание
                        </span>
                      )}
                    </div>
                    
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
                      {shift.start_time} — {shift.end_time}
                    </p>
                    
                    <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {shift.checked_in && (
                        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                          🟢 Приход: {formatTime(shift.check_in_time)}
                        </p>
                      )}
                      {shift.checked_out && (
                        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                          🔴 Уход: {formatTime(shift.check_out_time)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Правая часть - кнопки действий */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!shift.checked_in && (
                      <button
                        onClick={() => handleCheckIn(shift.shift_id)}
                        disabled={checking}
                        style={{
                          background: checking ? '#93c5fd' : 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 10,
                          padding: '10px 20px',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: checking ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s',
                          boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                          if (!checking) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.4)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!checking) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,185,129,0.3)';
                          }
                        }}
                      >
                        ✅ Приход
                      </button>
                    )}
                    
                    {shift.checked_in && !shift.checked_out && (
                      <button
                        onClick={() => handleCheckOut(shift.shift_id)}
                        disabled={checking}
                        style={{
                          background: checking ? '#fca5a5' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 10,
                          padding: '10px 20px',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: checking ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s',
                          boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                          if (!checking) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.4)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!checking) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.3)';
                          }
                        }}
                      >
                        🏠 Уход
                      </button>
                    )}
                    
                    {shift.checked_in && shift.checked_out && (
                      <div style={{
                        padding: '10px 20px',
                        background: '#d1fae5',
                        borderRadius: 10,
                        color: '#065f46',
                        fontWeight: 600,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                      }}>
                        ✓ Завершено
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Информационные карточки */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 16,
        marginTop: 24,
      }}>
        <div style={{
          background: '#eff6ff',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #bfdbfe',
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📌</div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e40af' }}>
            Как отметить время?
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#3b82f6' }}>
            1. Нажмите «Приход» в начале смены<br />
            2. Нажмите «Уход» в конце смены
          </p>
        </div>

        <div style={{
          background: '#fef3c7',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #fde68a',
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏰</div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#92400e' }}>
            Важно
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#d97706' }}>
            Опоздания более 15 минут фиксируются автоматически
          </p>
        </div>

        <div style={{
          background: '#ecfdf5',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #a7f3d0',
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📈</div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#065f46' }}>
            Статистика
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#10b981' }}>
            Вся история доступна в разделе «Отчёты»
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingPage;