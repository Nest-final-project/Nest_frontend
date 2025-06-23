import axios from 'axios';
import { accessTokenUtils } from '../utils/tokenUtils';

// 사용자 정보 캐시 (필요시 확장 가능)
const userCache = new Map();

/**
 * 채팅방 정보를 바탕으로 연락처 정보를 조회하는 함수
 * 새로운 ChatRoomReadDto 구조에 맞게 수정
 */
export const getContactInfo = async (mentorId, mentorName, menteeId, menteeName, currentUserId) => {
  // 현재 사용자가 멘토인지 멘티인지 판단
  const isCurrentUserMentor = currentUserId === mentorId;
  const contactId = isCurrentUserMentor ? menteeId : mentorId;
  const contactName = isCurrentUserMentor ? menteeName : mentorName;
  const contactRole = isCurrentUserMentor ? 'MENTEE' : 'MENTOR';
  
  console.log(`연락처 정보 조회: contactId=${contactId}, contactName=${contactName}, contactRole=${contactRole}`);
  
  return {
    id: contactId,
    name: contactName,
    nickName: contactName,
    role: contactRole,
    profileImage: null, // 기본 이미지 사용
    contactTitle: contactRole === 'MENTOR' ? '멘토' : '멘티',
    isCurrentUserMentor
  };
};

/**
 * 여러 채팅방의 연락처 정보를 한번에 조회하는 함수
 */
export const getContactsInfo = async (chatRooms, currentUserId) => {
  return chatRooms.map(room => {
    const { roomId, mentorId, mentorName, menteeId, menteeName } = room;
    const isCurrentUserMentor = currentUserId === mentorId;
    const contactId = isCurrentUserMentor ? menteeId : mentorId;
    const contactName = isCurrentUserMentor ? menteeName : mentorName;
    const contactRole = isCurrentUserMentor ? 'MENTEE' : 'MENTOR';
    
    return {
      ...room,
      contact: {
        id: contactId,
        name: contactName,
        profileImage: null, // 기본 이미지 사용
        role: contactRole
      },
      contactTitle: contactRole === 'MENTOR' ? '멘토' : '멘티',
      isCurrentUserMentor
    };
  });
};

/**
 * 개별 사용자 정보 조회 (기존 호환성 유지)
 */
export const getUserInfo = async (userId, userName = null) => {
  const cacheKey = `user-${userId}`;
  
  // 캐시에서 먼저 확인
  if (userCache.has(cacheKey)) {
    return userCache.get(cacheKey);
  }

  const userInfo = {
    id: userId,
    name: userName || `사용자 ${userId}`,
    nickName: userName || `사용자 ${userId}`,
    profileImage: null,
    role: null
  };

  // 캐시에 저장 (5분간)
  userCache.set(cacheKey, userInfo);
  setTimeout(() => {
    userCache.delete(cacheKey);
  }, 5 * 60 * 1000);

  return userInfo;
};

/**
 * 여러 사용자의 정보를 한번에 조회하는 함수 (기존 호환성 유지)
 */
export const getUsersInfo = async (userIds) => {
  return userIds.map(userId => ({
    id: userId,
    name: `사용자 ${userId}`,
    nickName: `사용자 ${userId}`,
    profileImage: null,
    role: null
  }));
};

/**
 * 모든 캐시를 초기화하는 함수
 */
export const clearAllCache = () => {
  userCache.clear();
};

/**
 * 캐시 상태를 확인하는 함수 (디버깅용)
 */
export const getCacheStatus = () => {
  return {
    userCacheSize: userCache.size,
    userCacheKeys: Array.from(userCache.keys())
  };
};

/**
 * 앱 시작 시 초기화 함수 (기존 호환성 유지)
 */
export const initializeUserService = async () => {
  console.log('사용자 서비스 초기화 완료 (새로운 ChatRoomReadDto 사용)');
};
