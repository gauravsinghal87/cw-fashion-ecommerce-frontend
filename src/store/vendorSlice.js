import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { post, get } from '../utils/apiMethods';
import { API } from '../utils/apiPaths';

const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  profile: null,
  vendorStats: null,
};

export const registerVendor = createAsyncThunk('vendor/register', async (vendorData, { rejectWithValue }) => {
  try {
    const { data } = await post(API.VENDORS.REGISTER, vendorData);
    // Note: In a real implementation, the registration might not return a token immediately
    // Email verification might be required first
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const loginVendor = createAsyncThunk('vendor/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await post(API.VENDORS.LOGIN, credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    const errData = error.response?.data;
    return rejectWithValue(errData || 'Login failed');
  }
});

export const getVendorProfile = createAsyncThunk('vendor/getProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await get(API.VENDORS.PROFILE);
    return data.vendor || data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch vendor profile');
  }
});

export const updateVendorProfile = createAsyncThunk('vendor/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await post(API.VENDORS.UPDATE_PROFILE, profileData);
    return data.vendor || data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update vendor profile');
  }
});

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.profile = null;
      state.vendorStats = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setVendorCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    setVendor: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setVendorProfile: (state, action) => {
      state.profile = action.payload;
    },
    setVendorStats: (state, action) => {
      state.vendorStats = action.payload;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginVendor.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerVendor.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerVendor.fulfilled, (state, action) => {
        state.loading = false;
        // Registration might not log in automatically
      })
      .addCase(registerVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getVendorProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getVendorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getVendorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setVendorCredentials, setVendor, setVendorProfile, setVendorStats, clearError } = vendorSlice.actions;
export default vendorSlice.reducer;