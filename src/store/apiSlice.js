import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getToken = () => localStorage.getItem('token');

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    'User', 'Products', 'Product', 'Orders', 'Order', 'Cart',
    'Vendor', 'Vendors', 'Categories', 'Brands', 'Coupons',
    'Wishlist', 'Wallet', 'Referrals', 'Returns', 'Banners',
    'Notifications', 'CMS', 'Withdrawals', 'Dashboard',
  ],
  endpoints: (builder) => ({}),
});
