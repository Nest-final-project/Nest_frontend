/**
 * 인증 관련 유틸리티 함수들
 */

/**
 * localStorage에서 JWT 토큰 가져오기
 * @returns {string|null} JWT 토큰 또는 null
 */
export const getToken = () => {
  try {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  } catch (error) {
    console.error('토큰 가져오기 실패:', error);
    return null;
  }
};

/**
 * localStorage에 JWT 토큰 저장
 * @param {string} token - 저장할 JWT 토큰
 */
export const setToken = (token) => {
  try {
    localStorage.setItem('accessToken', token);
  } catch (error) {
    console.error('토큰 저장 실패:', error);
  }
};

/**
 * localStorage에서 JWT 토큰 제거
 */
export const removeToken = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('토큰 제거 실패:', error);
  }
};

/**
 * JWT 토큰의 유효성 검사 (간단한 형식 체크)
 * @param {string} token - 검사할 JWT 토큰
 * @returns {boolean} 유효한 토큰 형식인지 여부
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // JWT는 3개의 부분으로 구성되며 '.'으로 구분됨
  const parts = token.split('.');
  return parts.length === 3;
};

/**
 * JWT 토큰에서 페이로드 디코딩 (클라이언트 사이드용)
 * 주의: 보안상 민감한 검증은 서버에서 수행해야 함
 * @param {string} token - 디코딩할 JWT 토큰
 * @returns {Object|null} 디코딩된 페이로드 또는 null
 */
export const decodeTokenPayload = (token) => {
  try {
    if (!isValidTokenFormat(token)) {
      return null;
    }
    
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return null;
  }
};

/**
 * JWT 토큰 만료 시간 확인
 * @param {string} token - 확인할 JWT 토큰
 * @returns {boolean} 토큰이 만료되었는지 여부
 */
export const isTokenExpired = (token) => {
  try {
    const payload = decodeTokenPayload(token);
    if (!payload || !payload.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('토큰 만료 확인 실패:', error);
    return true;
  }
};

/**
 * 사용자 인증 상태 확인
 * @returns {boolean} 인증된 상태인지 여부
 */
export const isAuthenticated = () => {
  const token = getToken();
  return token && isValidTokenFormat(token) && !isTokenExpired(token);
};

/**
 * Authorization 헤더 생성
 * @param {string} token - JWT 토큰 (선택사항, 없으면 localStorage에서 가져옴)
 * @returns {string|null} Authorization 헤더 값 또는 null
 */
export const getAuthHeader = (token = null) => {
  const authToken = token || getToken();
  return authToken ? `Bearer ${authToken}` : null;
};

/**
 * API 요청용 헤더 생성
 * @param {string} token - JWT 토큰 (선택사항)
 * @param {Object} additionalHeaders - 추가 헤더 (선택사항)
 * @returns {Object} API 요청용 헤더 객체
 */
export const getApiHeaders = (token = null, additionalHeaders = {}) => {
  const authHeader = getAuthHeader(token);
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  
  return headers;
};
