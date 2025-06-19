import notificationService from './notificationService';

// 백엔드 API URL 설정
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class AuthService {
  constructor() {
    this.isLoggedIn = false;
    this.token = null;
    this.user = null;
    this.listeners = new Set();
  }

  // 로그인
  async login(credentials) {
    try {
      console.log('로그인 시도 중...', credentials);
      console.log('사용할 백엔드 URL:', BACKEND_URL);
      
      // 직접 fetch를 사용해서 백엔드로 요청
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      console.log('서버 응답 상태:', response.status);
      console.log('서버 응답 헤더:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('서버 에러 응답:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: 서버 에러`);
      }

      const responseData = await response.json();
      console.log('서버 응답 전체:', responseData);
      
      // CommonResponse 구조에서 실제 데이터 추출
      const data = responseData.data || responseData;
      console.log('파싱된 데이터:', data);
      console.log('accessToken 값:', data.accessToken);
      console.log('accessToken 타입:', typeof data.accessToken);
      console.log('accessToken 길이:', data.accessToken ? data.accessToken.length : 0);
      
      // 필수 필드 확인
      if (!data.accessToken) {
        console.error('accessToken이 없습니다. 받은 데이터:', data);
        throw new Error('서버에서 액세스 토큰을 받지 못했습니다.');
      }

      // JWT 토큰 형식 검증
      if (!data.accessToken.startsWith('eyJ')) {
        console.error('올바르지 않은 JWT 토큰 형식:', data.accessToken);
        throw new Error('올바르지 않은 토큰 형식입니다.');
      }
      
      // 백엔드 응답 구조에 맞게 토큰과 사용자 정보 저장
      this.token = data.accessToken;
      this.user = {
        id: data.id,
        email: data.email,
        nickname: data.nickName || data.nickname,
        name: data.name || data.nickName || data.nickname
      };
      this.isLoggedIn = true;

      // localStorage에 토큰 저장
      localStorage.setItem('accessToken', this.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(this.user));

      console.log('로그인 성공. 저장된 사용자 정보:', this.user);
      console.log('저장된 토큰:', this.token);
      console.log('localStorage에 저장된 토큰:', localStorage.getItem('accessToken'));

      // 알림 서비스 시작
      notificationService.setAuthToken(this.token);
      notificationService.connect();

      // 상태 변경 알림
      this.notifyStateChange();

      return data;
    } catch (error) {
      console.error('로그인 에러 상세:', error);
      
      // 에러 상세 정보 로깅
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      
      throw error;
    }
  }

  // 로그아웃
  async logout() {
    try {
      if (this.token) {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: localStorage.getItem('refreshToken')
          })
        });
      }
    } catch (error) {
      console.error('로그아웃 API 호출 오류:', error);
    } finally {
      // 로컬 상태 정리
      this.clearAuthData();
      
      // 알림 서비스 중단
      notificationService.clearAuth();
      
      // 상태 변경 알림
      this.notifyStateChange();
    }
  }

  // 토큰 새로고침
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다');
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('토큰 새로고침 실패');
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;
      
      // 새 토큰 저장
      this.token = data.accessToken;
      localStorage.setItem('accessToken', this.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // 알림 서비스 토큰 업데이트
      notificationService.setAuthToken(this.token);

      return data;
    } catch (error) {
      console.error('토큰 새로고침 오류:', error);
      // 토큰 새로고침 실패 시 로그아웃 처리
      this.logout();
      throw error;
    }
  }

  // 애플리케이션 시작 시 저장된 인증 정보 복원
  initializeAuth() {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        this.token = token;
        this.user = JSON.parse(user);
        this.isLoggedIn = true;

        // 알림 서비스 시작
        notificationService.setAuthToken(this.token);
        notificationService.connect();

        // 토큰 유효성 검증
        this.validateToken();
      } catch (error) {
        console.error('인증 정보 복원 오류:', error);
        this.clearAuthData();
      }
    }

    this.notifyStateChange();
  }

  // 토큰 유효성 검증
  async validateToken() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        }
      });

      if (!response.ok) {
        throw new Error('토큰이 유효하지 않습니다');
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;
      this.user = data.user || data;
      localStorage.setItem('user', JSON.stringify(this.user));
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      // 토큰이 유효하지 않으면 새로고침 시도
      await this.refreshToken();
    }
  }

  // 인증 데이터 정리
  clearAuthData() {
    this.token = null;
    this.user = null;
    this.isLoggedIn = false;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // API 요청을 위한 인증 헤더 반환
  getAuthHeaders() {
    return this.token ? {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }

  // 인증된 API 요청
  async authenticatedFetch(url, options = {}) {
    // 상대 URL인 경우 백엔드 URL을 앞에 붙임
    const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
    
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers
    };

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers
      });

      // 401 에러 시 토큰 새로고침 시도
      if (response.status === 401 && this.token) {
        await this.refreshToken();
        
        // 새 토큰으로 재시도
        const retryHeaders = {
          ...this.getAuthHeaders(),
          ...options.headers
        };
        
        return fetch(fullUrl, {
          ...options,
          headers: retryHeaders
        });
      }

      return response;
    } catch (error) {
      console.error('인증된 요청 오류:', error);
      throw error;
    }
  }

  // 인증 상태 변경 리스너 등록
  addAuthStateListener(callback) {
    this.listeners.add(callback);
  }

  // 인증 상태 변경 리스너 제거
  removeAuthStateListener(callback) {
    this.listeners.delete(callback);
  }

  // 인증 상태 변경 알림
  notifyStateChange() {
    const authState = {
      isLoggedIn: this.isLoggedIn,
      user: this.user,
      token: this.token
    };

    this.listeners.forEach(callback => {
      try {
        callback(authState);
      } catch (error) {
        console.error('인증 상태 리스너 오류:', error);
      }
    });
  }

  // 현재 사용자 정보 반환
  getCurrentUser() {
    return this.user;
  }

  // 로그인 상태 확인
  isAuthenticated() {
    return this.isLoggedIn && !!this.token;
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();

export default authService;