import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import attendanceReducer from './slices/attendanceSlice';
import leaveReducer from './slices/leaveSlice';
import employeeReducer from './slices/employeeSlice';
import announcementReducer from './slices/announcementSlice';
import trainingReducer from './slices/trainingSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    leaves: leaveReducer,
    employees: employeeReducer,
    announcements: announcementReducer,
    trainings: trainingReducer,
    notifications: notificationReducer
  }
});

export default store;
