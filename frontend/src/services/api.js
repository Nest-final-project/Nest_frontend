import axios from 'axios';

// API 베이스 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - JWT 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // 로그인
  login: (loginData) => api.post('/api/auth/login', loginData),
  
  // 회원가입
  signup: (signupData) => api.post('/api/auth/signup', signupData),
  
  // 로그아웃
  logout: (logoutData) => api.post('/api/auth/logout', logoutData),
  
  // 토큰 갱신
  refresh: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
  
  // OAuth2 로그인 URL 가져오기
  getOAuth2LoginUrl: (provider) => api.get(`/api/oauth2/login/${provider}`),
};

// User API
export const userAPI = {
  // 마이페이지 조회
  getUser: () => api.get('/api/users/me'),
  
  // 사용자 정보 업데이트
  updateUser: (userData) => api.patch('/api/users/me', userData),
  
  // 비밀번호 수정
  updatePassword: (passwordData) => api.patch('/api/users/me/password', passwordData),

  // 추가정보 입력
  updateExtraInfo: (extraInfoData) => api.patch('/api/users/me/extra-info', extraInfoData),

  // 회원 탈퇴
  deleteUser: (deleteData) => api.delete('/api/users/me', deleteData),
};

// Profile API
export const profileAPI = {
  // 프로필 생성
  createProfile: (profileData) => api.post('/api/profiles', profileData),

  // 내 프로필 전체 조회
  getMyProfile: () => api.get('/api/profiles/me'),

  // 멘토 상세 조회
  getMentorDetail: (userId, profileId) => api.get(`/api/users/${userId}/profiles/${profileId}`),

  // 키워드로 검색
  searchMentors: (keyword) => api.get('/api/mentors/profiles', { params: { keyword } }),

  // 추천 멘토 프로필 조회
  getRecommendedMentors: (params) => api.get('/api/mentors/recommended-profiles', { params }),

  // 프로필 수정
  updateProfile: (profileId, profileData) => api.patch(`/api/profiles/${profileId}`, profileData),
};

// Consultation API
export const consultationAPI = {
  // 상담 목록 조회
  getConsultations: (params) => api.get('/api/consultations', { params }),
  
  // 상담 생성
  createConsultation: (consultationData) => api.post('/api/consultations', consultationData),
  
  // 상담 상세 조회
  getConsultationDetail: (consultationId) => api.get(`/api/consultations/${consultationId}`),
  
  // 상담 상태 업데이트
  updateConsultationStatus: (consultationId, status) => 
    api.patch(`/api/consultations/${consultationId}/status`, { status }),
};

// Reservation API
export const reservationAPI = {
  // 예약 목록 조회
  getReservations: (params) => api.get('/api/reservations', { params }),
  
  // 예약 생성
  createReservation: (reservationData) => api.post('/api/reservations', reservationData),
  
  // 예약 취소
  cancelReservation: (reservationId) => api.delete(`/api/reservations/${reservationId}`),
  
  // 멘토 가능 시간 조회
  getMentorAvailableSlots: (mentorId, date) => 
    api.get(`/api/reservations/mentors/${mentorId}/slots`, { params: { date } }),
};

// Chatroom API
export const chatroomAPI = {
  // 채팅방 목록 조회
  getChatrooms: () => api.get('/api/chatrooms'),
  
  // 채팅방 생성
  createChatroom: (chatroomData) => api.post('/api/chatrooms', chatroomData),
  
  // 채팅방 입장
  joinChatroom: (chatroomId) => api.post(`/api/chatrooms/${chatroomId}/join`),
  
  // 채팅방 나가기
  leaveChatroom: (chatroomId) => api.post(`/api/chatrooms/${chatroomId}/leave`),
};

// Message API
export const messageAPI = {
  // 메시지 목록 조회
  getMessages: (chatroomId, params) => 
    api.get(`/api/chatrooms/${chatroomId}/messages`, { params }),
  
  // 메시지 전송
  sendMessage: (chatroomId, messageData) => 
    api.post(`/api/chatrooms/${chatroomId}/messages`, messageData),
  
  // 메시지 읽음 처리
  markAsRead: (chatroomId, messageId) => 
    api.patch(`/api/chatrooms/${chatroomId}/messages/${messageId}/read`),
};

// Payment API
export const paymentAPI = {
  // 결제 요청
  createPayment: (paymentData) => api.post('/api/payments', paymentData),
  
  // 결제 확인
  verifyPayment: (paymentId) => api.get(`/api/payments/${paymentId}/verify`),
  
  // 결제 내역 조회
  getPaymentHistory: (params) => api.get('/api/payments/history', { params }),
};

// Review API
export const reviewAPI = {
  // 리뷰 목록 조회
  getReviews: (mentorId, params) => 
    api.get(`/api/reviews/mentors/${mentorId}`, { params }),
  
  // 리뷰 작성
  createReview: (reviewData) => api.post('/api/reviews', reviewData),
  
  // 리뷰 수정
  updateReview: (reviewId, reviewData) => 
    api.put(`/api/reviews/${reviewId}`, reviewData),
  
  // 리뷰 삭제
  deleteReview: (reviewId) => api.delete(`/api/reviews/${reviewId}`),
};

// Category API
export const categoryAPI = {
  // 카테고리 목록 조회
  getCategories: () => api.get('/api/categories'),
  
  // 카테고리별 멘토 조회
  getMentorsByCategory: (categoryId, params) => 
    api.get(`/api/categories/${categoryId}/mentors`, { params }),
};

// Notification API
export const notificationAPI = {
  // 알림 목록 조회
  getNotifications: (params) => api.get('/api/notifications', { params }),
  
  // 알림 읽음 처리
  markNotificationAsRead: (notificationId) => 
    api.patch(`/api/notifications/${notificationId}/read`),
  
  // 모든 알림 읽음 처리
  markAllNotificationsAsRead: () => api.patch('/api/notifications/read-all'),
};

export default api;
