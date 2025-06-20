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
import Checkout from './components/Checkout';
import Success from './components/Success';
import Fail from './components/Fail';
import PaymentSuccess from './components/PaymentSuccess';
import ChatRoom from './components/ChatRoom';
import MyPage from './components/MyPage';
import ChatContainer from './components/ChatContainer';
import NotificationContainer from './components/NotificationContainer';
import Inquiry from './components/Inquiry';
import { authUtils, userInfoUtils } from './utils/tokenUtils';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [inquiryTab, setInquiryTab] = useState('inquiries');

  // 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // 로그인 상태 확인 (Session Storage에서)
    const isLoggedIn = authUtils.isLoggedIn();
    const userData = userInfoUtils.getUserInfo();

    if (isLoggedIn && userData) {
      setIsLoggedIn(true);
      setUserInfo(userData);
      console.log('세션에서 로그인 상태 복원됨:', userData);
    }

    // 개발용: 전역 디버깅 함수 추가
    window.checkAuth = () => {
      console.group('🔍 현재 인증 상태');
      console.log('sessionStorage accessToken:', sessionStorage.getItem('accessToken') ? '존재' : '없음');
      console.log('sessionStorage userData:', sessionStorage.getItem('userData') ? '존재' : '없음');
      console.log('localStorage refreshToken:', localStorage.getItem('refreshToken') ? '존재' : '없음');
      console.log('React isLoggedIn 상태:', isLoggedIn);
      console.groupEnd();
    };

    console.log('💡 콘솔에서 window.checkAuth() 실행하여 인증 상태 확인 가능');

    return () => {
      // cleanup
      delete window.checkAuth;
    };

    // URL 파라미터 확인 (소셜 로그인 후 리다이렉트 처리)
    const urlParams = new URLSearchParams(window.location.search);
    const needsAdditionalInfo = urlParams.get('additional-info');
    
    // 토스페이먼츠 결제 결과 처리
    const paymentKey = urlParams.get('paymentKey');
    const orderId = urlParams.get('orderId');
    const amount = urlParams.get('amount');
    
    // 결제 실패 처리
    const errorCode = urlParams.get('code');
    const errorMessage = urlParams.get('message');
    
    if (needsAdditionalInfo === 'true') {
      setCurrentPage('social-signup');
    } else if (paymentKey && orderId && amount) {
      // 결제 성공
      setCurrentPage('success');
    } else if (errorCode && errorMessage) {
      // 결제 실패
      setCurrentPage('fail');
    }
  }, []);

  // 로그인 성공 처리
  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserInfo(userData);
    setIsLoginOpen(false);

    console.log('로그인 성공, App 상태 업데이트됨');
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

  // 토스페이 체크아웃 페이지로 이동
  const handleCheckout = (data) => {
    setPaymentData(data);
    setCurrentPage('checkout');
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
        onCheckout={handleCheckout}
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

  // 토스페이 체크아웃 페이지 렌더링
  if (currentPage === 'checkout') {
    return (
      <Checkout 
        paymentData={paymentData}
        onBack={handleBackToPayment}
        onSuccess={handlePaymentSuccess}
        onFail={handlePaymentFail}
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
      </div>
  );
};

export default App;
