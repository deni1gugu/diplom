import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './store';
import DashboardLayout from './components/Layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import SchedulePage from './pages/Schedule/SchedulePage';
import EmployeesPage from './pages/Employees/EmployeesPage';
import TimeTrackingPage from './pages/TimeTracking/TimeTrackingPage';
import ReportsPage from './pages/Reports/ReportsPage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="time-tracking" element={<TimeTrackingPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;