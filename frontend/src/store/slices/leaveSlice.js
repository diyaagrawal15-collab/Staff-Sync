import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMyLeaves = createAsyncThunk('leaves/fetchMyLeaves', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/leaves/my');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching leaves');
  }
});

export const applyLeave = createAsyncThunk('leaves/applyLeave', async (leaveData, { rejectWithValue }) => {
  try {
    const res = await api.post('/leaves/apply', leaveData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit leave request');
  }
});

export const fetchTeamLeaves = createAsyncThunk('leaves/fetchTeamLeaves', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/leaves/team');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching team leaves');
  }
});

export const fetchAllLeaves = createAsyncThunk('leaves/fetchAllLeaves', async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(filters || {}).toString();
    const res = await api.get(`/leaves/all?${params}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching all leaves');
  }
});

export const reviewLeave = createAsyncThunk('leaves/reviewLeave', async ({ id, status, reviewComment }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/leaves/${id}/review`, { status, reviewComment });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to review leave');
  }
});

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: {
    myLeaves: [],
    leaveBalance: { annual: 15, sick: 10, casual: 8 },
    teamLeaves: [],
    allLeaves: [],
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearLeaveMessage: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.myLeaves = action.payload.data;
        if (action.payload.balance) {
          state.leaveBalance = action.payload.balance;
        }
      })
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves.unshift(action.payload);
        state.successMessage = 'Leave application submitted successfully!';
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTeamLeaves.fulfilled, (state, action) => {
        state.teamLeaves = action.payload;
      })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.allLeaves = action.payload;
      })
      .addCase(reviewLeave.fulfilled, (state, action) => {
        state.successMessage = `Leave ${action.payload.status} successfully`;
        const updated = action.payload;
        state.teamLeaves = state.teamLeaves.map(l => l._id === updated._id ? { ...l, ...updated } : l);
        state.allLeaves = state.allLeaves.map(l => l._id === updated._id ? { ...l, ...updated } : l);
      });
  }
});

export const { clearLeaveMessage } = leaveSlice.actions;
export default leaveSlice.reducer;
