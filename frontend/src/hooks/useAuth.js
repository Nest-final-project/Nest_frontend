import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
    token: null,
    loading: true
  });

  useEffect(() => {
    // 앱 시작 시 저장된 인증 정보 복원
    const initializeAuth = async () => {
      try {
        authService.initializeAuth();
        
        // 인증 상태 리스너 등록
        const handleAuthStateChange = (newAuthState) => {
          setAuthState(prev => ({
            ...prev,
            ...newAuthState,
            loading: false
          }));
        };

        authService.addAuthStateListener(handleAuthStateChange);

        // 초기 상태 설정
        setAuthState({
          isLoggedIn: authService.isAuthenticated(),
          user: authService.getCurrentUser(),
          token: authService.token,
          loading: false
        });

        return () => {
          authService.removeAuthStateListener(handleAuthStateChange);
        };
      } catch (error) {
        console.error('인증 초기화 오류:', error);
        setAuthState({
          isLoggedIn: false,
          user: null,
          token: null,
          loading: false
        });
      }
    };

    const cleanup = initializeAuth();

    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  const login = async (credentials) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const result = await authService.login(credentials);
      return result;
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      await authService.logout();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setAuthState({
        isLoggedIn: false,
        user: null,
        token: null,
        loading: false
      });
    }
  };

  const refreshToken = async () => {
    try {
      return await authService.refreshToken();
    } catch (error) {
      // 토큰 새로고침 실패 시 로그아웃 처리
      await logout();
      throw error;
    }
  };

  return {
    ...authState,
    login,
    logout,
    refreshToken,
    authenticatedFetch: authService.authenticatedFetch.bind(authService)
  };
};

export default useAuth;