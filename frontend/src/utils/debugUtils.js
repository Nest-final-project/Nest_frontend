// 디버깅 유틸리티

import api from "../services/api.js";

/**
 * 현재 인증 상태를 콘솔에 출력
 */
export const debugAuthState = () => {
  console.group('🔍 현재 인증 상태 디버깅');
  
  // SessionStorage 확인
  const accessToken = sessionStorage.getItem('accessToken');
  const userData = sessionStorage.getItem('userData');
  
  console.log('📦 SessionStorage:');
  console.log('- accessToken:', accessToken ? `${accessToken.substring(0, 20)}...` : 'null');
  console.log('- userData:', userData ? 'exists' : 'null');
  
  // LocalStorage 확인 (refreshToken)
  const refreshToken = sessionStorage.getItem('refreshToken');
  console.log('📦 LocalStorage:');
  console.log('- refreshToken:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null');
  
  // 파싱된 사용자 데이터 확인
  if (userData) {
    try {
      const parsedUser = JSON.parse(userData);
      console.log('👤 파싱된 사용자 정보:', parsedUser);
    } catch (e) {
      console.error('❌ 사용자 데이터 파싱 실패:', e);
    }
  }
  
  console.groupEnd();
};

/**
 * API 요청 헤더를 수동으로 확인
 */
export const debugAPIHeaders = () => {
  const accessToken = sessionStorage.getItem('accessToken');
  
  if (accessToken) {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    console.group('📤 API 요청 헤더 미리보기');
    console.log('Headers:', headers);
    console.log('Bearer Token:', `Bearer ${accessToken.substring(0, 30)}...`);
    console.groupEnd();
    
    return headers;
  } else {
    console.warn('⚠️ AccessToken이 없어서 헤더를 생성할 수 없음');
    return null;
  }
};

/**
 * 테스트용 API 요청 함수
 */
export const testAPICall = async () => {
  const API_BASE_URL = api.API_BASE_URL;
  
  try {
    console.log('🧪 테스트 API 호출 시작...');
    
    // 헤더 확인
    const headers = debugAPIHeaders();
    if (!headers) {
      console.error('❌ 헤더가 없어서 API 호출 중단');
      return;
    }
    
    // 실제 fetch 요청 (테스트용)
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: headers
    });
    
    console.log('📊 응답 상태:', response.status);
    console.log('📊 응답 헤더:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API 응답 성공:', data);
    } else {
      const errorText = await response.text();
      console.error('❌ API 응답 실패:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ 네트워크 에러:', error);
  }
};

/**
 * 전체 디버깅 실행
 */
export const runFullDebug = () => {
  console.clear();
  console.log('🚀 전체 인증 디버깅 시작');
  console.log('='.repeat(50));
  
  debugAuthState();
  debugAPIHeaders();
  
  console.log('='.repeat(50));
  console.log('💡 다음 명령어로 테스트 API 호출 가능:');
  console.log('   debugUtils.testAPICall()');
};
