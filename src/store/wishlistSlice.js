import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, post, del } from '../utils/apiMethods';
import { API } from '../utils/apiPaths';

const initialState = {
  items: [],
  count: 0,
  loading: false,
};

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await get(API.USERS.WISHLIST);
    return data.products || data.wishlist || [];
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addWishlistItem: (state, action) => {
      if (!state.items.find(id => id === action.payload)) {
        state.items.push(action.payload);
        state.count = state.items.length;
      }
    },
    removeWishlistItem: (state, action) => {
      state.items = state.items.filter(id => id !== action.payload);
      state.count = state.items.length;
    },
    clearWishlist: (state) => {
      state.items = [];
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload.map(p => p._id || p);
        state.count = state.items.length;
        state.loading = false;
      })
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.rejected, (state) => { state.loading = false; });
  },
});

export const { addWishlistItem, removeWishlistItem, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
