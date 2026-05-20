import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const ReportsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/employees/').then(r => setEmployees(r.data.results || r.data)).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!dateFrom || !dateTo || !selectedEmployee) { toast.warning('Заполните все поля'); return; }
    setLoading(true);
    try {
      const res = await api.get('/reports/employee_report/', { params: { employee_id: selectedEmployee, date_from: dateFrom, date_to: dateTo } });
      setReportData(res.data);
    } catch { toast.error('Ошибка формирования отчёта'); }
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/reports/export_csv/', { params: { date_from: dateFrom, date_to: dateTo }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${dateFrom}_${dateTo}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Отчёт скачан');
    } catch { toast.error('Ошибка экспорта'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Отчёты</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="border rounded px-3 py-2">
            <option value="">Выберите сотрудника</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-3 py-2" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-3 py-2" />
          <div className="flex space-x-2">
            <button onClick={handleGenerate} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300">{loading ? '...' : 'Сформировать'}</button>
            <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">📥 CSV</button>
          </div>
        </div>
      </div>

      {reportData && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="font-medium text-lg">{reportData.employee?.full_name}</h2>
            <p className="text-gray-600">{reportData.employee?.position} • {reportData.period?.date_from} — {reportData.period?.date_to}</p>
          </div>
          <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
            {[
              { label: 'Рабочих дней', value: reportData.summary?.total_days },
              { label: 'Всего часов', value: reportData.summary?.total_hours },
              { label: 'Опозданий', value: reportData.summary?.late_days, color: 'text-red-600' },
              { label: 'Ранних уходов', value: reportData.summary?.early_departures, color: 'text-orange-600' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className={`text-2xl font-bold ${s.color || ''}`}>{s.value}</p>
                <p className="text-sm text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Смена</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Приход</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Уход</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Часы</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.records?.map((r, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{r.date}</td>
                  <td className="px-6 py-4">{r.start_time} - {r.end_time}</td>
                  <td className="px-6 py-4">{r.check_in ? new Date(r.check_in).toLocaleTimeString('ru-RU') : '-'}</td>
                  <td className="px-6 py-4">{r.check_out ? new Date(r.check_out).toLocaleTimeString('ru-RU') : '-'}</td>
                  <td className="px-6 py-4">{r.worked_hours} ч</td>
                  <td className="px-6 py-4">
                    {r.is_late && <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs mr-1">Опоздание</span>}
                    {r.is_early_departure && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Ранний уход</span>}
                    {!r.is_late && !r.is_early_departure && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Норма</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;