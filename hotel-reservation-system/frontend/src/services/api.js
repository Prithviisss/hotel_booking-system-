import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Auth APIs
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile')
};

// Room & Availability APIs
export const roomService = {
  getRooms: (params) => api.get('/rooms', { params }),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  getRoomTypes: () => api.get('/rooms/types/all'),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
  createRoomType: (data) => api.post('/rooms/types', data),
  updateRoomType: (id, data) => api.put(`/rooms/types/${id}`, data),
  checkAvailability: (criteria) => api.post('/rooms/availability', criteria)
};

// Booking APIs
export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getAllBookings: (params) => api.get('/bookings', { params }),
  cancelPreview: (id) => api.get(`/bookings/${id}/cancel-preview`),
  cancelBooking: (id, data) => api.post(`/bookings/${id}/cancel`, data)
};

// Payment APIs
export const paymentService = {
  createOrder: (bookingId) => api.post('/payments/create-order', { bookingId }),
  verifyPayment: (payload) => api.post('/payments/verify', payload),
  getPaymentByBookingId: (bookingId) => api.get(`/payments/${bookingId}`)
};

// Admin APIs
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenue: () => api.get('/admin/revenue'),
  getCustomers: () => api.get('/admin/customers'),
  getAllBookings: (params) => api.get('/admin/bookings', { params })
};

// Receptionist APIs
export const receptionService = {
  getOverview: () => api.get('/reception/overview'),
  searchReservation: (bookingId) => api.get(`/reception/bookings/${bookingId}`),
  assignRoom: (data) => api.put('/reception/assign-room', data),
  checkInGuest: (data) => api.post('/reception/check-in', data),
  checkOutGuest: (data) => api.post('/reception/check-out', data)
};

export default api;

