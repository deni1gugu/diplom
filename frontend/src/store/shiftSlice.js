import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchShifts = createAsyncThunk(
  'shifts/fetchShifts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/shifts/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка загрузки смен');
    }
  }
);

export const createShift = createAsyncThunk(
  'shifts/createShift',
  async (shiftData, { rejectWithValue }) => {
    try {
      const response = await api.post('/shifts/', shiftData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка создания смены');
    }
  }
);

export const updateShift = createAsyncThunk(
  'shifts/updateShift',
  async ({ id, ...shiftData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/shifts/${id}/`, shiftData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка обновления смены');
    }
  }
);

export const deleteShift = createAsyncThunk(
  'shifts/deleteShift',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/shifts/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка удаления смены');
    }
  }
);

const shiftSlice = createSlice({
  name: 'shifts',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
      })
      .addCase(fetchShifts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createShift.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateShift.fulfilled, (state, action) => {
        const index = state.items.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
      });
  },
});

export default shiftSlice.reducer;