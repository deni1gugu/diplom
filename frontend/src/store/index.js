import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import employeeReducer from './employeeSlice';
import shiftReducer from './shiftSlice';
import timeRecordReducer from './timeRecordSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    shifts: shiftReducer,
    timeRecords: timeRecordReducer,
  },
});

export default store;