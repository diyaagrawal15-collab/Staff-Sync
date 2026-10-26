import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching notifications');
  }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await api.put(`/notifications/${id}/read`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update notification');
  }
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.put('/notifications/read-all');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.list.find(n => n._id === action.payload);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.list.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      });
  }
});

export default notificationSlice.reducer;
