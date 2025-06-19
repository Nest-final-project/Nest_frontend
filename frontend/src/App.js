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

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

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
        />
      </div>
  );
};

export default App;
