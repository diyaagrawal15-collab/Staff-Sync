import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTodayStatus = createAsyncThunk('attendance/fetchToday', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/attendance/today');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching status');
  }
});

export const fetchMyAttendance = createAsyncThunk('attendance/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/attendance/my');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching attendance logs');
  }
});

export const clockInAction = createAsyncThunk('attendance/clockIn', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/attendance/clock-in', data || {});
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Clock in failed');
  }
});

export const clockOutAction = createAsyncThunk('attendance/clockOut', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/attendance/clock-out');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Clock out failed');
  }
});

export const fetchTeamAttendance = createAsyncThunk('attendance/fetchTeam', async (date, { rejectWithValue }) => {
  try {
    const url = date ? `/attendance/team?date=${date}` : '/attendance/team';
    const res = await api.get(url);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching team attendance');
  }
});

export const fetchAllAttendance = createAsyncThunk('attendance/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(filters || {}).toString();
    const res = await api.get(`/attendance/all?${params}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching all attendance');
  }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    todayRecord: null,
    history: [],
    teamAttendance: [],
    allAttendance: [],
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearAttendanceMessage: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayStatus.fulfilled, (state, action) => {
        state.todayRecord = action.payload;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(clockInAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockInAction.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecord = action.payload;
        state.successMessage = 'Successfully clocked in for today!';
        state.history.unshift(action.payload);
      })
      .addCase(clockInAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clockOutAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockOutAction.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecord = action.payload;
        state.successMessage = `Clocked out successfully! Total: ${action.payload.totalHours} hrs`;
        const idx = state.history.findIndex(h => h.date === action.payload.date);
        if (idx !== -1) {
          state.history[idx] = action.payload;
        }
      })
      .addCase(clockOutAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTeamAttendance.fulfilled, (state, action) => {
        state.teamAttendance = action.payload;
      })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.allAttendance = action.payload;
      });
  }
});

export const { clearAttendanceMessage } = attendanceSlice.actions;
export default attendanceSlice.reducer;
