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
import NotificationExample from './components/NotificationExample';
import useAuth from './hooks/useAuth';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  // 새로운 인증 훅 사용
  const { isLoggedIn, user, login, logout } = useAuth();

  useEffect(() => {
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
  const handleLoginSuccess = () => {
    // 로그인 성공 시 처리할 추가 로직이 있다면 여기에
    console.log('로그인 성공!');
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('home');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
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

  // 알림 테스트 페이지로 이동 (개발 환경)
  const handleNotificationTest = () => {
    setCurrentPage('notification-test');
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

  // 알림 테스트 페이지 렌더링 (개발 환경)
  if (currentPage === 'notification-test' && process.env.NODE_ENV === 'development') {
    return (
      <div>
        <div style={{ padding: '1rem', background: '#f3f4f6' }}>
          <button 
            onClick={handleBackToHome}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            ← 홈으로 돌아가기
          </button>
        </div>
        <NotificationExample />
        <NotificationContainer isLoggedIn={isLoggedIn} />
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
          isLoggedIn={isLoggedIn}
          userInfo={user}
          onChatRoom={handleChatRoom}
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
        {/* 전역 알림 컨테이너 */}
        <NotificationContainer isLoggedIn={isLoggedIn} />
        
        {/* 개발 환경에서만 알림 테스트 컴포넌트 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 10000,
            background: 'rgba(0,0,0,0.8)',
            padding: '10px',
            borderRadius: '8px'
          }}>
            <button 
              onClick={() => setCurrentPage('notification-test')}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              알림 테스트
            </button>
          </div>
        )}
      </div>
  );
};

export default App;
