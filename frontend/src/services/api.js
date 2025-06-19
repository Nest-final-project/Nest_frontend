// 기존 axios 기반 API를 유지하면서 새로운 authService와 연동
import axios from 'axios';
import authService from './authService';

// API 베이스 URL 설정 - 백엔드 서버 주소로 수정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - JWT 토큰 자동 추가 (authService 연동)
api.interceptors.request.use(
  (config) => {
    const token = authService.token || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 (authService 연동)
api.interceptors.response.use(
  (response) => {
    // 백엔드 CommonResponse 구조 처리
    if (response.data && response.data.data !== undefined) {
      // CommonResponse 구조인 경우 data 필드를 직접 반환
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // authService를 통한 토큰 갱신 시도
        await authService.refreshToken();
        // 원래 요청 재시도
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${authService.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        authService.logout();
        window.location.href = '/login';
      }
    }
    
    // 백엔드 에러 응답 구조 처리
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (loginData) => api.post('/api/auth/login', loginData),
  signup: (signupData) => api.post('/api/auth/signup', signupData),
  logout: (logoutData) => api.delete('/api/auth/logout', { data: logoutData }), // DELETE 메서드로 수정
  refresh: (refreshToken) => api.post('/api/auth/token/refresh', { refreshToken }), // 엔드포인트 수정
  validate: () => api.get('/api/auth/validate'),
  getOAuth2LoginUrl: (provider) => api.get(`/api/oauth2/login/${provider}`),
};

// User API
export const userAPI = {
  getUser: () => api.get('/api/users/me'),
  updateUser: (userData) => api.patch('/api/users/me', userData),
  updatePassword: (passwordData) => api.patch('/api/users/me/password', passwordData),
  updateExtraInfo: (extraInfoData) => api.patch('/api/users/me/extra-info', extraInfoData),
  deleteUser: (deleteData) => api.delete('/api/users/me', deleteData),
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
};

// Profile API
export const profileAPI = {
  getAllMentors: () => api.get('/api/mentors/profiles'),
  createProfile: (profileData) => api.post('/api/profiles', profileData),
  getMyProfile: () => api.get('/api/profiles/me'),
  getMentorDetail: (userId, profileId) => api.get(`/api/users/${userId}/profiles/${profileId}`),
  searchMentors: (keyword) => api.get('/api/mentors/profiles', { params: { keyword } }),
  getRecommendedMentors: (params) => api.get('/api/mentors/recommended-profiles', { params }),
  updateProfile: (profileId, profileData) => api.patch(`/api/profiles/${profileId}`, profileData),
};

// Consultation API
export const consultationAPI = {
  getConsultations: (params) => api.get('/api/consultations', { params }),
  createConsultation: (consultationData) => api.post('/api/consultations', consultationData),
  getConsultationDetail: (consultationId) => api.get(`/api/consultations/${consultationId}`),
  updateConsultationStatus: (consultationId, status) => 
    api.patch(`/api/consultations/${consultationId}/status`, { status }),
};

// Reservation API
export const reservationAPI = {
  getReservations: (params) => api.get('/api/reservations', { params }),
  createReservation: (reservationData) => api.post('/api/reservations', reservationData),
  cancelReservation: (reservationId) => api.delete(`/api/reservations/${reservationId}`),
  getMentorAvailableSlots: (mentorId, date) => 
    api.get(`/api/reservations/mentors/${mentorId}/slots`, { params: { date } }),
  extendReservation: (reservationId, data) => api.post(`/api/reservations/${reservationId}/extend`, data),
};

// Chat API (백엔드 연동 추가)
export const chatAPI = {
  getChatRooms: (params) => api.get('/api/chatrooms', { params }),
  getChatRoom: (chatRoomId) => api.get(`/api/chatrooms/${chatRoomId}`),
  createChatRoom: (data) => api.post('/api/chatrooms', data),
  sendMessage: (chatRoomId, message) => api.post(`/api/chatrooms/${chatRoomId}/messages`, message),
  getMessages: (chatRoomId, params) => api.get(`/api/chatrooms/${chatRoomId}/messages`, { params }),
  extendChatRoom: (chatRoomId, data) => api.post(`/api/chatrooms/${chatRoomId}/extend`, data)
};

// Chatroom API (기존 이름 유지)
export const chatroomAPI = {
  getChatrooms: () => api.get('/api/chatrooms'),
};

// Message API
export const messageAPI = {
  getMessages: (chatroomId, params) => api.get(`/api/chatrooms/messages/${chatroomId}`, {params}),
};

// Payment API
export const paymentAPI = {
  createPayment: (paymentData) => api.post('/api/payments', paymentData),
  confirmPayment: (confirmData) => api.post('/api/payments/confirm', confirmData),
  verifyPayment: (paymentId) => api.get(`/api/payments/${paymentId}/verify`),
  cancelPayment: (paymentId, cancelData) => api.post(`/api/payments/${paymentId}/cancel`, cancelData),
  getPaymentHistory: (params) => api.get('/api/payments/history', { params }),
  getPaymentDetail: (paymentId) => api.get(`/api/payments/${paymentId}`),
};

// Review API
export const reviewAPI = {
  getReviews: (mentorId, params) => api.get(`/api/reviews/mentors/${mentorId}`, { params }),
  createReview: (reviewData) => api.post('/api/reviews', reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/api/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/api/reviews/${reviewId}`),
};

// Category API
export const categoryAPI = {
  getCategories: () => api.get('/api/categories'),
  getMentorsByCategory: (categoryId, params) => 
    api.get(`/api/categories/${categoryId}/mentors`, { params }),
};

// Notification API (백엔드 연동 추가)
export const notificationAPI = {
  getNotifications: (params) => api.get('/api/notifications', { params }),
  markAsRead: (notificationId) => api.patch(`/api/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
  markNotificationAsRead: (notificationId) => api.patch(`/api/notifications/${notificationId}/read`),
  markAllNotificationsAsRead: () => api.patch('/api/notifications/read-all'),
};

export default api;