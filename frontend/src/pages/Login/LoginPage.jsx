import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../../store/authSlice';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(login({ username, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Декоративные круги */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Карточка */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
          {/* Логотип */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Вход в систему</h1>
            <p className="text-slate-400 mt-1">Учёт рабочего времени</p>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm backdrop-blur">
              {error}
            </div>
          )}

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Логин</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
                placeholder="Введите логин"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
                placeholder="Введите пароль"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          {/* Демо-доступ */}
          <div className="mt-6 p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-xs text-slate-400 text-center mb-2">Демо-доступ</p>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-slate-300 font-medium">admin</p>
                <p className="text-slate-500">admin123</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-slate-300 font-medium">user</p>
                <p className="text-slate-500">user123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;