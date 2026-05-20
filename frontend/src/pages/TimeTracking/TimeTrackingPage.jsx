import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const TimeTrackingPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [todayStatus, setTodayStatus] = useState([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => { loadStatus(); }, []);

  const loadStatus = async () => {
    try {
      const res = await api.get('/time-records/today_status/');
      setTodayStatus(res.data);
    } catch {}
  };

  const handleCheckIn = async (shiftId) => {
    setChecking(true);
    try {
      await api.post('/time-records/check_in/', { shift_id: shiftId });
      toast.success('Приход отмечен');
      loadStatus();
    } catch (err) { toast.error(err.response?.data?.error || 'Ошибка'); }
    setChecking(false);
  };

  const handleCheckOut = async (shiftId) => {
    setChecking(true);
    try {
      await api.post('/time-records/check_out/', { shift_id: shiftId });
      toast.success('Уход отмечен');
      loadStatus();
    } catch (err) { toast.error(err.response?.data?.error || 'Ошибка'); }
    setChecking(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Учёт рабочего времени</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Сегодня ({new Date().toLocaleDateString('ru-RU')})</h2>
        {todayStatus.length === 0 ? <p className="text-gray-500">На сегодня нет смен</p> :
          todayStatus.map(s => (
            <div key={s.shift_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2">
              <div>
                <p className="font-medium">Смена: {s.start_time} - {s.end_time}</p>
                <p className="text-sm text-gray-600">
                  {s.checked_in ? `Приход: ${new Date(s.check_in_time).toLocaleTimeString('ru-RU')}` : 'Приход не отмечен'}
                  {s.is_late && <span className="ml-2 text-red-600">⚠ Опоздание</span>}
                </p>
                {s.checked_out && <p className="text-sm text-gray-600">Уход: {new Date(s.check_out_time).toLocaleTimeString('ru-RU')}</p>}
              </div>
              <div>
                {!s.checked_in && <button onClick={() => handleCheckIn(s.shift_id)} disabled={checking} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300">Отметить приход</button>}
                {s.checked_in && !s.checked_out && <button onClick={() => handleCheckOut(s.shift_id)} disabled={checking} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300">Отметить уход</button>}
                {s.checked_in && s.checked_out && <span className="text-green-600 font-medium">✓ Завершено</span>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default TimeTrackingPage;