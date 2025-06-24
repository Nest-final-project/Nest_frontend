import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import MentorSection from './components/MentorSection';
import CTASection from './components/CTASection';
import ParticleBackground from './components/ParticleBackground';
import Login from './components/Login';
import SocialSignup from './components/SocialSignup';
import MentorList from './components/MentorList';
import MentorProfile from './components/MentorProfile';
import Booking from './components/Booking';
import Payment from './components/Payment';
import TossPaymentApp from './components/TossPayment';
import Success from './components/Success';
import Fail from './components/Fail';
import PaymentSuccess from './components/PaymentSuccess';
import ChatRoom from './components/ChatRoom';
import MyPage from './components/MyPage.js';
import ChatContainer from './components/ChatContainer';
import NotificationContainer from './components/NotificationContainer';
import SSEExample from './components/SSEExample.js';
import Inquiry from './components/Inquiry';
import AdminDashboard from './components/AdminDashboard';
import { authUtils, userInfoUtils } from './utils/tokenUtils';
import { registerDebugFunctions } from './utils/websocketDebug';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [currentTossPage, setCurrentTossPage] = useState('toss-payment');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [inquiryTab, setInquiryTab] = useState('inquiries');
  const [appError, setAppError] = useState(null);

  // 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    try {
      // 로그인 상태 확인 (Session Storage에서)
      const isLoggedIn = authUtils.isLoggedIn();
      const userData = userInfoUtils.getUserInfo();

      if (isLoggedIn && userData) {
        setIsLoggedIn(true);
        setUserInfo(userData);
        console.log('세션에서 로그인 상태 복원됨:', userData);
        
        // 관리자 역할 체크 및 자동 리다이렉트
        if (userData.userRole === 'ADMIN') {
          console.log('🔐 관리자 사용자 감지됨 - 관리자 대시보드로 이동');
          setCurrentPage('admin-dashboard');
        }
      }

      // 개발용: 전역 디버깅 함수 추가
      window.checkAuth = () => {
        console.group('🔍 현재 인증 상태');
        console.log('sessionStorage accessToken:', sessionStorage.getItem('accessToken') ? '존재' : '없음');
        console.log('sessionStorage userData:', sessionStorage.getItem('userData') ? '존재' : '없음');
        console.log('localStorage refreshToken:', localStorage.getItem('refreshToken') ? '존재' : '없음');
        console.log('React isLoggedIn 상태:', isLoggedIn);
        console.log('User Role:', userData?.userRole || '없음');
        console.groupEnd();
      };

      console.log('💡 콘솔에서 window.checkAuth() 실행하여 인증 상태 확인 가능');

      // WebSocket 디버깅 함수 등록 (개발 환경에서만)
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        registerDebugFunctions();
      }

      // URL 파라미터 확인 (소셜 로그인 후 리다이렉트 처리)
      const urlParams = new URLSearchParams(window.location.search);
      const needsAdditionalInfo = urlParams.get('additional-info');
      const pageParam = urlParams.get('page');

      // 토스페이먼츠 결제 결과 처리 (경로 기반)
      const currentPath = window.location.pathname;
      const paymentKey = urlParams.get('paymentKey');
      const orderId = urlParams.get('orderId');
      const amount = urlParams.get('amount');
      const reservationId = urlParams.get('reservationId');

      // 결제 실패 처리
      const errorCode = urlParams.get('code');
      const errorMessage = urlParams.get('message');

      if (needsAdditionalInfo === 'true') {
        setCurrentPage('social-signup');
      } else if (currentPath === '/toss/success' && paymentKey && orderId && amount) {
        // 토스 결제 성공 - 새로운 플로우 (경로 기반)
        console.log('✅ 토스 결제 성공 (경로):', {paymentKey, orderId, amount, reservationId});
        setCurrentTossPage('toss-success');
        setCurrentPage('toss-payment');
      } else if (currentPath === '/toss/fail') {
        // 토스 결제 실패 - 새로운 플로우 (경로 기반)
        console.log('❌ 토스 결제 실패 (경로):', {errorCode, errorMessage});
        setCurrentTossPage('toss-fail');
        setCurrentPage('toss-payment');
      } else if (pageParam === 'toss-success' && paymentKey && orderId && amount) {
        // 토스 결제 성공 - 새로운 플로우 (파라미터 기반 - 폴백)
        console.log('✅ 토스 결제 성공 (파라미터):', {paymentKey, orderId, amount, reservationId});
        setCurrentTossPage('toss-success');
        setCurrentPage('toss-payment');
      } else if (pageParam === 'toss-fail') {
        // 토스 결제 실패 - 새로운 플로우 (파라미터 기반 - 폴백)
        console.log('❌ 토스 결제 실패 (파라미터):', {errorCode, errorMessage});
        setCurrentTossPage('toss-fail');
        setCurrentPage('toss-payment');
      } else if (paymentKey && orderId && amount && reservationId) {
        // 기존 결제 성공 - 기존 플로우 유지
        console.log('✅ 기존 결제 성공 파라미터:', {paymentKey, orderId, amount, reservationId});
        setCurrentPage('success');
      } else if (errorCode && errorMessage) {
        // 기존 결제 실패 - 기존 플로우 유지
        setCurrentPage('fail');
      }
    } catch (error) {
      console.error('App 초기화 에러:', error);
      setAppError(`애플리케이션 초기화 실패: ${error.message}`);
    }

    return () => {
      // cleanup
      delete window.checkAuth;
    };
  }, []);

  // 로그인 성공 처리
  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserInfo(userData);
    setIsLoginOpen(false);

    console.log('로그인 성공, App 상태 업데이트됨');
    
    // 관리자 역할인 경우 자동으로 관리자 대시보드로 이동
    if (userData.userRole === 'ADMIN') {
      console.log('🔐 관리자 로그인 감지 - 관리자 대시보드로 이동');
      setCurrentPage('admin-dashboard');
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    // 백엔드 로그아웃은 Header 컴포넌트에서 처리됨
    // 여기서는 클라이언트 측 상태만 정리
    authUtils.clearAllAuthData();
    setIsLoggedIn(false);
    setUserInfo(null);
    setCurrentPage('home');
    console.log('클라이언트 로그아웃 완료 - 모든 토큰과 사용자 정보 삭제됨');
  };

  // 프로필 클릭 시 마이페이지로 이동
  const handleProfileClick = () => {
    setCurrentPage('mypage');
  };

  // 카테고리별 멘토 리스트 페이지로 이동
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage('mentor-list');
  };

  // 멘토 프로필 페이지로 이동
  const handleMentorSelect = (mentor) => {
    setSelectedMentor(mentor);
    setCurrentPage('mentor-profile');
  };

  // 홈으로 돌아가기
  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  // 멘토 리스트로 돌아가기
  const handleBackToList = () => {
    setCurrentPage('mentor-list');
  };

  // 예약 페이지로 이동
  const handleBooking = () => {
    setCurrentPage('booking');
  };

  // 결제 페이지로 이동
  const handlePayment = (data) => {
    setBookingData(data);
    setCurrentPage('payment');
  };

  // 토스 결제 페이지로 이동 (새로 추가)
  const handleTossPayment = (data) => {
    console.log('🎯 App.js handleTossPayment 호출됨');
    console.log('📦 Payment.js에서 받은 데이터:', data);
    console.log('📦 기존 bookingData:', bookingData);
    
    // Payment.js에서 전달된 데이터를 bookingData로 설정
    const finalBookingData = data || bookingData;
    console.log('📦 최종 bookingData (TossPayment로 전달):', finalBookingData);
    
    setBookingData(finalBookingData);
    setCurrentTossPage('toss-payment');
    setCurrentPage('toss-payment');
    
    console.log('🎯 토스 결제 페이지로 이동 완료');
  };

  // 토스 결제 성공 페이지로 이동
  const handleTossSuccess = () => {
    setCurrentTossPage('toss-success');
  };

  // 토스 결제 실패 페이지로 이동
  const handleTossFail = () => {
    setCurrentTossPage('toss-fail');
  };

  // 채팅방으로 이동
  const handleChatRoom = (mentor) => {
    setSelectedMentor(mentor);
    setCurrentPage('chat');
  };

  // 결제 완료 페이지로 이동
  const handlePaymentComplete = (result) => {
    setPaymentResult(result);
    setCurrentPage('payment-success');
  };

  // 결제 성공 페이지로 이동
  const handlePaymentSuccess = () => {
    setCurrentPage('success');
  };

  // 결제 실패 페이지로 이동
  const handlePaymentFail = () => {
    setCurrentPage('fail');
  };

  // 예약 페이지로 돌아가기
  const handleBackToBooking = () => {
    setCurrentPage('booking');
  };

  // 결제 페이지로 돌아가기
  const handleBackToPayment = () => {
    setCurrentPage('payment');
  };

  // 멘토 프로필로 돌아가기
  const handleBackToProfile = () => {
    setCurrentPage('mentor-profile');
  };

  // 앱 에러 상태 표시
  if (appError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>💥</div>
        <h1 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '24px' }}>
          애플리케이션 오류
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px', maxWidth: '500px' }}>
          {appError}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            페이지 새로고침
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }} 
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            모든 데이터 초기화
          </button>
        </div>
      </div>
    );
  }

  // 문의 페이지로 이동
  const handleInquiry = (tabType = 'inquiries') => {
    setInquiryTab(tabType);
    setCurrentPage('inquiry');
  };

  // 문의 페이지 렌더링
  if (currentPage === 'inquiry') {
    return (
      <Inquiry
        onBack={handleBackToHome}
        initialTab={inquiryTab}
      />
    );
  }

  // 관리자 대시보드 렌더링
  if (currentPage === 'admin-dashboard') {
    return (
      <AdminDashboard
        onBack={() => {
          // 관리자에서 나올 때는 완전 로그아웃 처리
          handleLogout();
        }}
        userInfo={userInfo}
      />
    );
  }

  // 관리자 대시보드로 이동
  const handleAdminDashboard = () => {
    if (userInfo?.userRole === 'ADMIN') {
      setCurrentPage('admin-dashboard');
    }
  };

  // SSE 데모 페이지로 이동
  const handleSSEDemo = () => {
    setCurrentPage('sse-demo');
  };

  // SSE 데모 페이지 렌더링
  if (currentPage === 'sse-demo') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onLoginClick={() => setIsLoginOpen(true)}
          onCategorySelect={handleCategorySelect}
          onProfileClick={handleProfileClick}
          isLoggedIn={isLoggedIn}
          userInfo={userInfo}
          onChatRoom={handleChatRoom}
          onLogout={handleLogout}
          onSSEDemo={handleSSEDemo}
          onAdminDashboard={handleAdminDashboard}
        />
        <SSEExample />
        <Login
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // 소셜 회원가입 페이지 렌더링
  if (currentPage === 'social-signup') {
    return <SocialSignup />;
  }

  // 마이페이지 렌더링
  if (currentPage === 'mypage') {
    return (
      <MyPage
        onBack={handleBackToHome}
        onLogout={handleLogout}
      />
    );
  }

  // 멘토 리스트 페이지 렌더링
  if (currentPage === 'mentor-list') {
    return (
      <div className="app">
        <ParticleBackground />
        <Header
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onLoginClick={() => setIsLoginOpen(true)}
          onCategorySelect={handleCategorySelect}
          onProfileClick={handleProfileClick}
          onInquiry={handleInquiry}
          isLoggedIn={isLoggedIn}
          userInfo={userInfo}
          onChatRoom={handleChatRoom}
          onLogout={handleLogout}
          onSSEDemo={handleSSEDemo}
          onAdminDashboard={handleAdminDashboard}
        />
        <MentorList
          category={selectedCategory} 
          onBack={handleBackToHome}
          onMentorSelect={handleMentorSelect}
        />
        <Login 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        
        {/* 알림 컨테이너 - 로그인된 사용자만 */}
        <NotificationContainer isLoggedIn={isLoggedIn} />
      </div>
    );
  }

  // 채팅방 페이지 렌더링
  if (currentPage === 'chat') {
    return (
      <div>
        <ChatContainer
          onBack={handleBackToHome}
          isLoggedIn={isLoggedIn}
        />
      </div>
    );
  }

  // 예약 페이지 렌더링
  if (currentPage === 'booking') {
    return (
      <Booking 
        mentor={selectedMentor}
        onBack={handleBackToProfile}
        onBooking={handlePayment}
      />
    );
  }

  // 결제 페이지 렌더링
  if (currentPage === 'payment') {
    return (
      <Payment 
        bookingData={bookingData}
        onBack={handleBackToBooking}
        onPaymentComplete={handlePaymentComplete}
        onTossPayment={handleTossPayment}
      />
    );
  }

  // 결제 완료 페이지 렌더링
  if (currentPage === 'payment-success') {
    return (
      <PaymentSuccess 
        paymentResult={paymentResult}
        onHome={handleBackToHome}
      />
    );
  }

  // 토스 결제 페이지 렌더링 (새로 추가)
  if (currentPage === 'toss-payment') {
    return (
      <TossPaymentApp
        currentTossPage={currentTossPage}
        bookingData={bookingData}
        paymentData={paymentData}
        onBack={() => setCurrentPage('payment')}
        onHome={handleBackToHome}
        onTossSuccess={handleTossSuccess}
        onTossFail={handleTossFail}
        onPaymentComplete={handlePaymentComplete}
      />
    );
  }

  // 결제 성공 페이지 렌더링
  if (currentPage === 'success') {
    return (
      <Success 
        paymentData={paymentData}
        onHome={handleBackToHome}
      />
    );
  }

  // 결제 실패 페이지 렌더링
  if (currentPage === 'fail') {
    return (
      <Fail 
        onBack={handleBackToPayment}
        onHome={handleBackToHome}
      />
    );
  }

  // 멘토 프로필 페이지 렌더링
  if (currentPage === 'mentor-profile') {
    return (
      <MentorProfile 
        mentor={selectedMentor}
        onBack={handleBackToList}
        onBooking={handleBooking}
      />
    );
  }

  // 메인 페이지 렌더링
  return (
      <div className="app">
        <ParticleBackground />
        <Header 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen}
          onLoginClick={() => setIsLoginOpen(true)}
          onCategorySelect={handleCategorySelect}
          onProfileClick={handleProfileClick}
          onInquiry={handleInquiry}
          isLoggedIn={isLoggedIn}
          userInfo={userInfo}
          onChatRoom={handleChatRoom}
          onLogout={handleLogout}
          onSSEDemo={handleSSEDemo}
          onAdminDashboard={handleAdminDashboard}
        />
        <main className="main-content">
          <HeroSection />
          <StatsSection />
          <MentorSection />
          <CTASection />
        </main>
        <Login 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        
        {/* 알림 컨테이너 - 로그인된 사용자만 */}
        <NotificationContainer isLoggedIn={isLoggedIn} />
      </div>
  );
};

export default App;
