import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchTimeRecords = createAsyncThunk(
  'timeRecords/fetchTimeRecords',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/time-records/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка загрузки');
    }
  }
);

export const checkIn = createAsyncThunk(
  'timeRecords/checkIn',
  async (shiftId, { rejectWithValue }) => {
    try {
      const response = await api.post('/time-records/check_in/', { shift_id: shiftId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка отметки');
    }
  }
);

export const checkOut = createAsyncThunk(
  'timeRecords/checkOut',
  async (shiftId, { rejectWithValue }) => {
    try {
      const response = await api.post('/time-records/check_out/', { shift_id: shiftId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка отметки');
    }
  }
);

const timeRecordSlice = createSlice({
  name: 'timeRecords',
  initialState: { items: [], todayStatus: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeRecords.pending, (state) => { state.loading = true; })
      .addCase(fetchTimeRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
      })
      .addCase(fetchTimeRecords.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(checkIn.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(checkOut.fulfilled, (state, action) => {
        const index = state.items.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export default timeRecordSlice.reducer;