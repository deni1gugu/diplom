import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/employees/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка загрузки');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/employees/', employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка создания');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, ...employeeData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/employees/${id}/`, employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка обновления');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка удаления');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createEmployee.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      });
  },
});

export default employeeSlice.reducer;