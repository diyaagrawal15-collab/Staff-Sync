import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAnnouncements = createAsyncThunk('announcements/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/announcements');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching announcements');
  }
});

export const createAnnouncement = createAsyncThunk('announcements/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/announcements', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create announcement');
  }
});

export const deleteAnnouncement = createAsyncThunk('announcements/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/announcements/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete announcement');
  }
});

const announcementSlice = createSlice({
  name: 'announcements',
  initialState: {
    list: [],
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearAnnouncementMessage: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.successMessage = 'Announcement published!';
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.list = state.list.filter(a => a._id !== action.payload);
        state.successMessage = 'Announcement removed.';
      });
  }
});

export const { clearAnnouncementMessage } = announcementSlice.actions;
export default announcementSlice.reducer;
