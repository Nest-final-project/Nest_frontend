// 인증 관련 유틸리티 함수들
import { accessTokenUtils, userInfoUtils } from './tokenUtils';

/**
 * 현재 토큰 가져오기
 */
export const getToken = () => {
  return accessTokenUtils.getAccessToken();
};

/**
 * 인증 상태 확인
 */
export const isAuthenticated = () => {
  const hasAccessToken = accessTokenUtils.hasAccessToken();
  const hasUserInfo = userInfoUtils.getUserInfo() !== null;
  return hasAccessToken && hasUserInfo;
};

/**
 * 로그아웃 처리
 */
export const logout = () => {
  accessTokenUtils.removeAccessToken();
  userInfoUtils.removeUserInfo();
};

/**
 * 사용자 정보 가져오기
 */
export const getUserInfo = () => {
  return userInfoUtils.getUserInfo();
};

/**
 * JWT 토큰 디코딩 (페이로드만)
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return null;
  }
};

/**
 * 토큰 만료 여부 확인
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};
