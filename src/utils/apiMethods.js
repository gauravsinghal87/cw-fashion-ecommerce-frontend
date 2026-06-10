import api from './axios';

export const get = (url, params) => api.get(url, { params });
export const post = (url, data, config) => api.post(url, data, config);
export const put = (url, data, config) => api.put(url, data, config);
export const patch = (url, data) => api.patch(url, data);
export const del = (url) => api.delete(url);
