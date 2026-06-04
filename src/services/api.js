import axios from 'axios';
import toast from 'react-hot-toast';

const rawApiBaseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const apiBaseURL = `${rawApiBaseURL.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor - attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent duplicate 403 toasts
let deactivatedToastShown = false;

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    const isSessionProbe = error.config?.url?.includes('/auth/me');

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!isSessionProbe && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      if (!deactivatedToastShown) {
        deactivatedToastShown = true;
        toast.error(message);
      }
    } else if (error.response?.status !== 400) {
      toast.error(message);
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;

// Named API helpers

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),

  // OTP (email verification)
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),

  // RESET PASSWORD (OTP)
  sendResetOtp: (data) => api.post('/auth/send-reset-otp', data),
  verifyResetOtp: (data) => api.post('/auth/verify-reset-otp', data),
  resetPasswordWithToken: (data) => api.post('/auth/reset-password-otp', data),

  // Other auth
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotVerification: (email) => api.post('/auth/resend-verification', { email }),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const auctionAPI = {
  getAll: (params) => api.get('/auctions', { params }),
  getOne: (id) => api.get(`/auctions/${id}`),
  create: (data) => api.post('/auctions', data),
  update: (id, data) => api.put(`/auctions/${id}`, data),
  delete: (id) => api.delete(`/auctions/${id}`),
  toggleWatch: (id) => api.post(`/auctions/${id}/watch`),
  getMyListings: (params) => api.get('/auctions/my/listings', { params }),
  getCategoryStats: () => api.get('/auctions/categories/stats'),
};

export const bidAPI = {
  place: (auctionId, data) => api.post(`/bids/${auctionId}`, data),
  getForAuction: (auctionId, params) => api.get(`/bids/${auctionId}`, { params }),
  getMyBids: (params) => api.get('/bids/user/my', { params }),
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (formData) =>
    api.put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getPublicProfile: (id) => api.get(`/users/${id}/profile`),
  getNotifications: (params) => api.get('/users/notifications', { params }),
  markNotificationsRead: (ids) =>
    api.put('/users/notifications/read', { notificationIds: ids }),
  getWatchlist: () => api.get('/users/watchlist'),
};

// SSLCommerz + COD + order lookup
export const paymentAPI = {
  sslcommerzInit:     (auctionId, data) => api.post(`/payments/sslcommerz-init/${auctionId}`, data),
  confirm:            (auctionId, data) => api.post(`/payments/confirm/${auctionId}`, data),
  getTransactions:    (params)          => api.get('/payments/transactions', { params }),
  getOrderForAuction: (auctionId)       => api.get(`/payments/order/${auctionId}`),
};

export const uploadAPI = {
  uploadImages: (formData) =>
    api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (publicId) =>
    api.delete(`/upload/image/${encodeURIComponent(publicId)}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id, reason) =>
    api.put(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) =>
    api.put(`/admin/users/${id}/unban`),
  updateUserRole: (id, role) =>
    api.put(`/admin/users/${id}/role`, { role }),
  getAuctions: (params) =>
    api.get('/admin/auctions', { params }),
  toggleFeatured: (id) =>
    api.put(`/admin/auctions/${id}/feature`),
  cancelAuction: (id, reason) =>
    api.put(`/admin/auctions/${id}/cancel`, { reason }),
  getTransactions: (params) =>
    api.get('/admin/transactions', { params }),
};
