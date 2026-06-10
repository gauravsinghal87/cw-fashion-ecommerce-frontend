import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../utils/apiMethods';
import { API } from '../utils/apiPaths';

const initialState = {
  items: [],
  coupon: null,
  shippingInfo: null,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await get(API.CART.ITEM(''));
    return data.cart || { items: [], coupon: null, shippingInfo: null };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCartThunk = createAsyncThunk('cart/add', async (item, { rejectWithValue }) => {
  try {
    const { data } = await post(API.CART.ADD, item);
    return data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => { state.items = []; state.coupon = null; state.shippingInfo = null; },
    removeCoupon: (state) => { state.coupon = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.coupon = action.payload.coupon || null;
        state.shippingInfo = action.payload.shippingInfo || null;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.coupon = action.payload.coupon || null;
        state.shippingInfo = action.payload.shippingInfo || null;
      });
  },
});

export const { clearCart, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
