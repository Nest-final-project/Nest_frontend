import axios from 'axios';
import { accessTokenUtils, refreshTokenUtils } from '../utils/tokenUtils';

// API 베이스 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// 공개 API 전용 axios 인스턴스 (토큰 없이)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CORS 설정: 쿠키 및 인증 정보 포함
  timeout: 10000, // 10초 타임아웃
});

// 공개 API는 토큰 없이 요청
publicApi.interceptors.request.use(
  (config) => {
    console.log(`🌐 [PUBLIC API] ${config.method?.toUpperCase()} ${config.url} - 토큰 없이 요청`);
    return config;
  },
  (error) => {
    console.error('❌ 공개 API 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 일반 API 인스턴스 (기존 유지)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CORS 설정: 쿠키 및 인증 정보 포함
  timeout: 10000, // 10초 타임아웃
});

// 디버깅을 위한 baseURL 확인
console.log('🔗 API Base URL:', API_BASE_URL);

// 요청 인터셉터 - JWT 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    // 공개 API 목록 (토큰이 필요하지 않은 엔드포인트)
    const publicEndpoints = [
      '/api/categories',
      '/api/auth/login',
      '/api/auth/signup',
      '/api/mentors/profiles', // 멘토 목록 조회 (로그인 없이도 볼 수 있음)
      '/api/oauth2/login'
    ];
    
    // 현재 요청 URL이 공개 엔드포인트인지 확인
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // 요청 로깅
    console.log(`🌐 [API 요청] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    if (isPublicEndpoint) {
      console.log(`📖 [공개 API] 토큰 없이 요청`);
    } else {
      // 비공개 API에만 토큰 추가
      const accessToken = accessTokenUtils.getAccessToken();
      
      if (accessToken) {
        // 토큰이 이미 "Bearer " 접두사를 포함하고 있는지 확인
        if (accessToken.startsWith('Bearer ')) {
          config.headers.Authorization = accessToken;
          console.log(`🔑 [인증 API] Authorization 헤더 추가 (이미 Bearer 포함): ${accessToken.substring(0, 20)}...`);
        } else {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log(`🔑 [인증 API] Authorization 헤더 추가 (Bearer 추가): Bearer ${accessToken.substring(0, 20)}...`);
        }
        console.log(`🔑 [전체 Authorization 헤더] ${config.headers.Authorization}`);
      } else {
        console.warn(`⚠️ [인증 API] Access Token이 없음 - ${config.url}`);
      }
    }
    
    // 요청 헤더 로깅
    console.log(`📋 [요청 헤더]`, JSON.stringify(config.headers, null, 2));
    
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API 응답] ${response.config.method?.toUpperCase()} ${response.config.url} - 상태: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error(`❌ [API 에러] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`);
    console.error(`❌ [에러 상태] ${error.response?.status} ${error.response?.statusText}`);
    console.error(`❌ [에러 데이터]`, error.response?.data);
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 401 에러 감지 - 토큰 갱신 시도...');
      
      try {
        const refreshToken = refreshTokenUtils.getRefreshToken();
        if (!refreshToken) {
          throw new Error('Refresh token이 없습니다');
        }
        
        // 토큰 갱신 요청
        const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/token/refresh`, {
          refreshToken: refreshToken
        });
        
        const newAccessToken = refreshResponse.data.accessToken;
        accessTokenUtils.setAccessToken(newAccessToken);
        
        // 원래 요청에 새 토큰으로 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log('✅ 토큰 갱신 성공 - 원래 요청 재시도');
        
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ 토큰 갱신 실패:', refreshError);
        
        // 토큰 갱신 실패 시 로그아웃 처리
        accessTokenUtils.removeAccessToken();
        refreshTokenUtils.removeRefreshToken();
        
        // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
        if (!window.location.pathname.includes('/login')) {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          window.location.reload(); // 페이지 새로고침으로 로그인 상태 초기화
        }
      }
    }
    
    // CORS 에러 처리
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.error('🚫 네트워크/CORS 에러 감지');
      error.isCorsError = true;
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
  
  // 로그아웃 (refreshToken을 body에 포함)
  logout: () => {
    const refreshToken = refreshTokenUtils.getRefreshToken();
    const logoutData = {
      refreshToken: refreshToken
    };
    return api.delete('/api/auth/logout', { data: logoutData });
  },
  
  // 토큰 갱신
  refresh: () => {
    const refreshToken = refreshTokenUtils.getRefreshToken();
    return api.post('/api/auth/token/refresh', { refreshToken });
  },
  
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

  // 회원 탈퇴 (refreshToken을 body에 포함)
  deleteUser: () => {
    const refreshToken = refreshTokenUtils.getRefreshToken();
    const deleteData = {
      refreshToken: refreshToken
    };
    return api.delete('/api/users/me', { data: deleteData });
  },
};

// Profile API
export const profileAPI = {
  // 모든 멘토 프로필 조회 (공개 API - 토큰 없이)
  getAllMentors: () => publicApi.get('/api/mentors/profiles'),

  // 프로필 생성
  createProfile: (profileData) => api.post('/api/profiles', profileData),

  // 내 프로필 전체 조회
  getMyProfile: () => api.get('/api/profiles/me'),

  // 멘토 상세 조회 (공개 API - 토큰 없이)
  getMentorDetail: (userId, profileId) => publicApi.get(`/api/users/${userId}/profiles/${profileId}`),

  // 키워드로 검색 (공개 API - 토큰 없이)
  searchMentors: (keyword) => publicApi.get('/api/mentors/profiles', { params: { keyword } }),

  // 추천 멘토 프로필 조회 (공개 API - 토큰 없이)
  getRecommendedMentors: (params) => publicApi.get('/api/mentors/recommended-profiles', { params }),

  // 프로필 수정
  updateProfile: (profileId, profileData) => api.patch(`/api/profiles/${profileId}`, profileData),

  // 프로필 경력 조회
  getCareerList: (profileId) => api.get(`/api/profiles/${profileId}/careers`),

  // 티켓 조회
  getTicketList: () => api.get('/api/ticket'),
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
  //createChatroom: (chatroomData) => api.post('/api/chatrooms', chatroomData),

  // 채팅방 입장
  //joinChatroom: (chatroomId) => api.post(`/api/chatrooms/${chatroomId}/join`),

  // 채팅방 나가기
  //leaveChatroom: (chatroomId) => api.post(`/api/chatrooms/${chatroomId}/leave`),
};

// Message API
export const messageAPI = {
  // 메시지 목록 조회
  getMessages: (chatroomId, params) =>
      api.get(`/api/chatrooms/messages/${chatroomId}`, {params}),

};

// Payment API
export const paymentAPI = {
  // 결제 요청
  createPayment: (paymentData) => api.post('/api/payments', paymentData),
  
  // 토스페이먼츠 결제 승인
  confirmPayment: (confirmData) => api.post('/api/payments/confirm', confirmData),
  
  // 결제 확인
  verifyPayment: (paymentId) => api.get(`/api/payments/${paymentId}/verify`),
  
  // 결제 취소
  cancelPayment: (paymentId, cancelData) => api.post(`/api/payments/${paymentId}/cancel`, cancelData),
  
  // 결제 내역 조회
  getPaymentHistory: (params) => api.get('/api/payments/history', { params }),
  
  // 결제 상세 조회
  getPaymentDetail: (paymentId) => api.get(`/api/payments/${paymentId}`),
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
  // 카테고리 목록 조회 (공개 API - 토큰 없이)
  getCategories: () => publicApi.get('/api/categories'),
  
  // 카테고리별 멘토 조회 (공개 API - 토큰 없이)
  getMentorsByCategory: (categoryId, params) => 
    publicApi.get(`/api/categories/${categoryId}/mentors`, { params }),
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

// Ticket API
export const ticketAPI = {
  // 티켓 목록 조회
  getTickets: (ticketId, params) =>
      api.get(`/api/ticket`, { params }),

  // 타캣 작성
  createTicket: (ticketData) => api.post('/api/admin/ticket', ticketData),

  // 리뷰 수정
  updateTicket: (ticketId, ticketData) =>
      api.patch(`/api/admin/ticket/${ticketId}`, ticketData),

  // 리뷰 삭제
  deleteReview: (ticketId) => api.delete(`/api/admin/ticket/${ticketId}`),
};


export default api;
