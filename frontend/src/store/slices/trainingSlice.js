import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTrainings = createAsyncThunk('trainings/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(filters || {}).toString();
    const res = await api.get(`/trainings?${params}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching trainings');
  }
});

export const enrollInTraining = createAsyncThunk('trainings/enroll', async (id, { rejectWithValue }) => {
  try {
    const res = await api.post(`/trainings/${id}/enroll`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to enroll');
  }
});

export const updateTrainingProgress = createAsyncThunk('trainings/updateProgress', async ({ id, progress, score }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/trainings/${id}/progress`, { progress, score });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update progress');
  }
});

export const createTraining = createAsyncThunk('trainings/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/trainings', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create training');
  }
});

const trainingSlice = createSlice({
  name: 'trainings',
  initialState: {
    list: [],
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearTrainingMessage: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainings.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(enrollInTraining.fulfilled, (state, action) => {
        state.successMessage = 'Successfully enrolled in course!';
        const idx = state.list.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateTrainingProgress.fulfilled, (state, action) => {
        state.successMessage = 'Training progress updated!';
        const idx = state.list.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(createTraining.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.successMessage = 'New training program created!';
      });
  }
});

export const { clearTrainingMessage } = trainingSlice.actions;
export default trainingSlice.reducer;
