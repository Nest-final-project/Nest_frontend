// 토큰 관리 유틸리티

/**
 * Access Token 관리 (Session Storage 사용)
 */
export const accessTokenUtils = {
  // Access Token 저장
  setAccessToken: (token) => {
    if (token) {
      sessionStorage.setItem('accessToken', token);
      console.log('✅ Access Token 저장됨');
    } else {
      console.warn('⚠️ Access Token이 null/undefined');
    }
  },

  // Access Token 조회
  getAccessToken: () => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.warn('⚠️ sessionStorage에 Access Token 없음');
    }
    return token;
  },

  // Access Token 삭제
  removeAccessToken: () => {
    sessionStorage.removeItem('accessToken');
    console.log('🗑️ Access Token 삭제됨');
  },

  // Access Token 유무 확인
  hasAccessToken: () => {
    return !!sessionStorage.getItem('accessToken');
  }
};

/**
 * Refresh Token 관리 (HttpOnly 쿠키에서 읽기)
 */
export const refreshTokenUtils = {
  // Refresh Token 조회 (쿠키에서)
  getRefreshToken: () => {
    // HttpOnly 쿠키는 JavaScript로 직접 접근할 수 없으므로
    // 백엔드에서 별도 API를 통해 가져오거나, 
    // 로그인 응답에서 별도 필드로 받아야 함
    return localStorage.getItem('refreshToken'); // 임시로 localStorage 사용
  },

  // Refresh Token 저장 (임시: 실제로는 백엔드에서 HttpOnly 쿠키로 설정)
  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem('refreshToken', token);
    }
  },

  // Refresh Token 삭제
  removeRefreshToken: () => {
    localStorage.removeItem('refreshToken');
  },

  // 쿠키에서 특정 값 읽기 (일반 쿠키용, HttpOnly는 접근 불가)
  getCookieValue: (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
};

/**
 * 사용자 정보 관리 (Session Storage 사용)
 */
export const userInfoUtils = {
  // 사용자 정보 저장
  setUserInfo: (userInfo) => {
    if (userInfo) {
      sessionStorage.setItem('userData', JSON.stringify(userInfo));
    }
  },

  // 사용자 정보 조회
  getUserInfo: () => {
    const userData = sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // 사용자 정보 삭제
  removeUserInfo: () => {
    sessionStorage.removeItem('userData');
  }
};

/**
 * 로그인 데이터 설정
 */
export const authUtils = {
  // 로그인 여부 확인
  isLoggedIn: () => {
    const hasAccessToken = accessTokenUtils.hasAccessToken();
    const hasUserInfo = userInfoUtils.getUserInfo() !== null;
    console.log('🔍 로그인 상태 확인:', { hasAccessToken, hasUserInfo });
    return hasAccessToken && hasUserInfo;
  },

  // 완전 로그아웃 (모든 토큰과 사용자 정보 삭제)
  clearAllAuthData: () => {
    console.log('🗑️ 모든 인증 데이터 삭제 시작...');
    accessTokenUtils.removeAccessToken();
    refreshTokenUtils.removeRefreshToken();
    userInfoUtils.removeUserInfo();
    console.log('✅ 모든 인증 데이터 삭제 완료');
  },

  // 로그인 데이터 설정
  setAuthData: (accessToken, refreshToken, userInfo) => {
    console.log('💾 인증 데이터 설정 시작...');
    console.log('- accessToken 받음:', accessToken ? accessToken.substring(0, 30) + '...' : 'null');
    console.log('- refreshToken 받음:', refreshToken ? refreshToken.substring(0, 30) + '...' : 'null');
    console.log('- userInfo 받음:', userInfo ? userInfo.email : 'null');
    
    if (accessToken) {
      accessTokenUtils.setAccessToken(accessToken);
      console.log('✅ Access Token 저장 완료');
    } else {
      console.warn('⚠️ Access Token이 null이므로 저장하지 않음');
    }
    
    if (refreshToken) {
      refreshTokenUtils.setRefreshToken(refreshToken);
      console.log('✅ Refresh Token 저장 완료');
    } else {
      console.warn('⚠️ Refresh Token이 null이므로 저장하지 않음');
    }
    
    if (userInfo) {
      userInfoUtils.setUserInfo(userInfo);
      console.log('✅ User Info 저장 완료');
    } else {
      console.warn('⚠️ User Info가 null이므로 저장하지 않음');
    }
    
    // 저장 후 검증
    setTimeout(() => {
      console.log('🔍 저장 후 검증:');
      console.log('- Access Token 확인:', accessTokenUtils.getAccessToken() ? '✅' : '❌');
      console.log('- User Info 확인:', userInfoUtils.getUserInfo() ? '✅' : '❌');
    }, 50);
  },
};

// JWT 토큰에서 페이로드를 디코딩하는 함수
export const decodeJWT = (token) => {
  if (!token) {
    console.warn('디코딩할 토큰이 없습니다.');
    return null;
  }
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ JWT 디코딩 실패:', error);
    return null;
  }
};
