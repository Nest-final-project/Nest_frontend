import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Settings,
  BookOpen,
  CreditCard,
  Briefcase,
  Clock,
  LogOut,
  ArrowLeft,
  UserPlus,
  Star
} from 'lucide-react';
import './MyPage.css';
import { userInfoUtils, authUtils } from '../utils/tokenUtils.js';
import { userAPI, authAPI } from '../services/api.js';
import BookingHistory from './MyPage/BookingHistory.jsx';
import PaymentHistory from './MyPage/PaymentHistory.jsx';
import Reviews from "./MyPage/Reviews.jsx";

// Lazy load components for better performance
const BasicInfo = lazy(() => import('./MyPage/BasicInfo.jsx'));
const CareerHistory = lazy(() => import('./MyPage/CareerHistory.jsx'));
const MentorRegistration = lazy(() => import('./MyPage/MentorRegistration.jsx'));
const ConsultationTime = lazy(() => import('./MyPage/ConsultationTime.jsx'));

const MyPage = ({ onBack, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // URL 경로에서 현재 탭 추출
  const getCurrentTab = () => {
    const path = location.pathname.replace('/mypage', '') || '/profile';
    return path.substring(1) || 'profile'; // 앞의 '/' 제거
  };
  
  const [activeTab, setActiveTab] = useState(getCurrentTab());

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      setError("로그인이 필요합니다. 다시 로그인해주세요.");
      authUtils.clearAllAuthData();
      onLogout();
      setLoading(false);
      return;
    }

    try {
      const response = await userAPI.getUser();

      if (response.data && response.data.data) {
        const backendUserData = response.data.data;

        // 기존 세션의 토큰 유지
        const prevUserData = userInfoUtils.getUserInfo();

        const mappedUserInfo = {
          id: backendUserData.id,
          name: backendUserData.name,
          email: backendUserData.email,
          nickName: backendUserData.nickName,
          phoneNumber: backendUserData.phoneNumber,
          userRole: backendUserData.userRole,
          socialType: backendUserData.socialType,
          createdAt: backendUserData.createdAt,
          profileImage: backendUserData.profileImage || '/default-profile.svg',
          bank: backendUserData.bank || '',
          accountNumber: backendUserData.accountNumber || '',
          token: prevUserData?.token // 기존 토큰 유지
        };

        setUserInfo(mappedUserInfo);
        userInfoUtils.setUserInfo(mappedUserInfo);

      } else {
        setError("사용자 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("인증이 만료되었습니다. 다시 로그인해주세요.");
        authUtils.clearAllAuthData();
        onLogout();
      } else if (error.response?.status === 404) {
        setError("사용자 정보를 찾을 수 없습니다.");
      } else if (error.code === 'ERR_NETWORK') {
        setError("서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
      } else {
        setError("마이페이지를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // 백엔드 호출 실패해도 클라이언트 로그아웃은 진행
    } finally {
      authUtils.clearAllAuthData();
      onLogout();
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    navigate(`/mypage/${tabName}`);
  };
  
  // URL 변경 시 activeTab 업데이트
  useEffect(() => {
    const currentTab = getCurrentTab();
    setActiveTab(currentTab);
  }, [location.pathname]);

  if (loading && !userInfo) {
    return (
      <div className="mypage-container">
        <div className="mypage-loading">
          <p>사용자 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mypage-container">
        <div className="mypage-loading error">
          <p>{error}</p>
          <div className="error-actions">
            <button className="back-button" onClick={onBack}>뒤로 가기</button>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="mypage-container">
        <div className="mypage-loading">
          <p>사용자 정보를 찾을 수 없습니다.</p>
          <button className="back-button" onClick={onBack}>뒤로 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="icon" />
        </button>
        <h1>마이페이지</h1>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut className="icon" />
          로그아웃
        </button>
      </div>

      <div className="mypage-content">
        <div className="profile-section">
          <div className="profile-image-container">
            <img
              src={userInfo.profileImage || '/default-profile.svg'}
              alt="프로필"
              className="profile-image"
            />
            <button className="profile-edit-button">
              <Settings className="icon" />
            </button>
          </div>
          <div className="profile-info">
            <h2>{userInfo.name}</h2>
            <p>{userInfo.email}</p>
            <span className="user-level">
              {userInfo.userRole === 'MENTOR' ? '멘토' : '멘티'}
            </span>
          </div>
        </div>

        <div className="mypage-main">
          {/* 왼쪽 사이드바 */}
          <div className="sidebar">
            <div className="sidebar-header">
              <h3>메뉴</h3>
            </div>
            <nav className="sidebar-nav">
              <button
                className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabChange('profile')}
              >
                <User className="sidebar-icon" />
                <span>프로필</span>
              </button>

              <button
                className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => handleTabChange('bookings')}
              >
                <BookOpen className="sidebar-icon" />
                <span>{userInfo.userRole === 'MENTOR' ? '예정된 예약' : '예약 내역'}</span>
              </button>

              {/* 멘티만 결제 내역 표시 */}
              {userInfo.userRole === 'MENTEE' && (
                  <>
                    <button
                        className={`sidebar-item ${activeTab === 'payments' ? 'active' : ''}`}
                        onClick={() => handleTabChange('payments')}
                    >
                      <CreditCard className="sidebar-icon" />
                      <span>결제 내역</span>
                    </button>

                    <button
                    className={`sidebar-item ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => handleTabChange('reviews')}
                    >
                      <Star className="sidebar-icon" />
                      <span>리뷰 내역</span>
                    </button>
                  </>
              )}

              {/* 멘토 전용 메뉴 */}
              {userInfo.userRole === 'MENTOR' && (
                <>
                  <div className="sidebar-divider"></div>
                  <div className="sidebar-section-title">멘토 전용</div>

                  <button
                    className={`sidebar-item ${activeTab === 'mentorRegister' ? 'active' : ''}`}
                    onClick={() => handleTabChange('mentorRegister')}
                  >
                    <UserPlus className="sidebar-icon" />
                    <span>멘토 등록</span>
                  </button>

                  <button
                    className={`sidebar-item ${activeTab === 'careers' ? 'active' : ''}`}
                    onClick={() => handleTabChange('careers')}
                  >
                    <Briefcase className="sidebar-icon" />
                    <span>경력 목록</span>
                  </button>

                  <button
                    className={`sidebar-item ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => handleTabChange('schedule')}
                  >
                    <Clock className="sidebar-icon" />
                    <span>상담 가능 시간</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* 오른쪽 컨텐츠 영역 */}
          <div className="content-area">
            <Suspense fallback={
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>로딩 중...</p>
              </div>
            }>
              <Routes>
                <Route path="/" element={
                  <BasicInfo 
                    userInfo={userInfo} 
                    setUserInfo={setUserInfo} 
                    onLogout={onLogout} 
                  />
                } />
                <Route path="/profile" element={
                  <BasicInfo 
                    userInfo={userInfo} 
                    setUserInfo={setUserInfo} 
                    onLogout={onLogout} 
                  />
                } />
                <Route path="/bookings" element={
                  <BookingHistory userInfo={userInfo} />
                } />
                <Route path="/payments" element={
                  userInfo?.userRole === 'MENTEE' ? (
                    <PaymentHistory userInfo={userInfo} />
                  ) : (
                    <div className="access-denied">
                      <p>접근 권한이 없습니다.</p>
                    </div>
                  )
                } />
                <Route path="/careers" element={
                  userInfo?.userRole === 'MENTOR' ? (
                    <CareerHistory userInfo={userInfo} />
                  ) : (
                    <div className="access-denied">
                      <p>접근 권한이 없습니다.</p>
                    </div>
                  )
                } />
                <Route path="/mentorRegister" element={
                  userInfo?.userRole === 'MENTOR' ? (
                    <MentorRegistration userInfo={userInfo} onLogout={onLogout} />
                  ) : (
                    <div className="access-denied">
                      <p>접근 권한이 없습니다.</p>
                    </div>
                  )
                } />
                <Route path="/schedule" element={
                  userInfo?.userRole === 'MENTOR' ? (
                    <ConsultationTime userInfo={userInfo} />
                  ) : (
                    <div className="access-denied">
                      <p>접근 권한이 없습니다.</p>
                    </div>
                  )
                } />
                <Route path="/reviews" element={
                  userInfo?.userRole === 'MENTEE' ? (
                      <Reviews userInfo={userInfo}/>
                  ) : (
                      <div className="access-denied">
                        <p>접근 권한이 없습니다.</p>
                      </div>
                  )
                } />
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
