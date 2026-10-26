import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchEmployees = createAsyncThunk('employees/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params || {}).toString();
    const res = await api.get(`/employees?${query}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching employees');
  }
});

export const fetchManagers = createAsyncThunk('employees/fetchManagers', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/employees/managers');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error fetching managers');
  }
});

export const createEmployee = createAsyncThunk('employees/create', async (employeeData, { rejectWithValue }) => {
  try {
    const res = await api.post('/employees', employeeData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create employee');
  }
});

export const updateEmployee = createAsyncThunk('employees/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/employees/${id}`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update employee');
  }
});

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    list: [],
    managers: [],
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearEmployeeMessage: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchManagers.fulfilled, (state, action) => {
        state.managers = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.total += 1;
        state.successMessage = 'Employee onboarded successfully!';
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.successMessage = 'Employee details updated successfully!';
        const idx = state.list.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      });
  }
});

export const { clearEmployeeMessage } = employeeSlice.actions;
export default employeeSlice.reducer;
