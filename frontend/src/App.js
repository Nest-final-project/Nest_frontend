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
  const [isInitializing, setIsInitializing] = useState(true); // 초기화 상태 추가

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 로그인 상태 확인 (Session Storage에서)
        const isLoggedIn = authUtils.isLoggedIn();
        const userData = userInfoUtils.getUserInfo();

        if (isLoggedIn && userData) {
          setIsLoggedIn(true);
          setUserInfo(userData);
          console.log('세션에서 로그인 상태 복원됨:', userData);
          
          // 🔐 ADMIN 사용자인 경우 즉시 관리자 대시보드로 이동
          if (userData.userRole === 'ADMIN') {
            console.log('🔐 ADMIN 사용자 감지됨 - 바로 관리자 대시보드로 이동');
            setCurrentPage('admin-dashboard');
            setIsInitializing(false);
            return; // 다른 로직 실행하지 않음
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
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();

    return () => {
      // cleanup
      delete window.checkAuth;
    };
  }, []);

  // 🔐 userInfo가 변경될 때마다 ADMIN 체크 (로그인 후 즉시 리다이렉트용)
  useEffect(() => {
    console.log('🔍 userInfo useEffect 실행됨:', {
      userInfo: userInfo,
      userRole: userInfo?.userRole,
      currentPage: currentPage,
      isAdmin: userInfo?.userRole === 'ADMIN'
    });
    
    if (userInfo && userInfo.userRole === 'ADMIN' && currentPage !== 'admin-dashboard') {
      console.log('🔐 userInfo 업데이트 감지 - ADMIN 사용자를 관리자 대시보드로 이동');
      console.log('현재 페이지:', currentPage, '→ admin-dashboard로 변경');
      setCurrentPage('admin-dashboard');
    }
  }, [userInfo, currentPage]);

  // 로그인 성공 처리
  const handleLoginSuccess = (userData) => {
    console.log('🎉 handleLoginSuccess 호출됨!');
    console.log('📦 받은 userData:', userData);
    console.log('🔐 사용자 역할:', userData?.userRole);
    console.log('📄 현재 페이지:', currentPage);
    
    setIsLoggedIn(true);
    setUserInfo(userData);
    setIsLoginOpen(false);

    console.log('✅ 상태 업데이트 완료 - isLoggedIn: true, userInfo 설정됨, 로그인 모달 닫힘');
    // 🔐 ADMIN 체크는 useEffect에서 userInfo가 업데이트될 때 자동으로 처리됨
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

  // 프로필 클릭 시 마이페이지로 이동 (ADMIN 사용자는 관리자 대시보드로)
  const handleProfileClick = () => {
    // ADMIN 사용자인 경우 직접 관리자 대시보드로 이동
    if (userInfo && userInfo.userRole === 'ADMIN') {
      console.log('🔐 프로필 클릭 시 ADMIN 사용자 감지됨 - 관리자 대시보드로 이동');
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('mypage');
    }
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
  const handleTossSuccess = async (tossPaymentData) => {
    console.log('🎉 토스 결제 성공! PaymentComplete로 이동');
    console.log('💳 토스 승인 완료 데이터:', tossPaymentData);
    
    // 🔥 예약 ID로 실제 DB에서 예약 정보 조회
    let actualBookingData = null;
    const reservationId = tossPaymentData?.reservationId || 
                         tossPaymentData?.originalResponse?.reservationId;
    
    if (reservationId) {
      try {
        console.log('🔍 예약 ID로 실제 예약 정보 조회 중:', reservationId);
        
        // 동적 import 사용
        const { reservationAPI } = await import('./services/api');
        const reservationResponse = await reservationAPI.getReservation(reservationId);
        actualBookingData = reservationResponse.data;
        
        console.log('✅ 실제 DB에서 가져온 예약 정보:', actualBookingData);
      } catch (error) {
        console.error('❌ 예약 정보 조회 실패:', error);
        console.warn('⚠️ 예약 정보 조회 실패 - 기본 데이터 사용');
      }
    } else {
      console.warn('⚠️ reservationId가 없어서 예약 정보를 조회할 수 없습니다');
    }
    console.log('📦 현재 bookingData:', bookingData);
    
    // sessionStorage에서 결제 데이터 복원 (토스 결제 과정에서 저장된 데이터)
    const savedPaymentData = sessionStorage.getItem('tossPaymentData');
    let savedData = null;
    if (savedPaymentData) {
      try {
        savedData = JSON.parse(savedPaymentData);
        console.log('💾 복원된 결제 데이터:', savedData);
        
        // 🔍 중요: 복원된 데이터 구조 상세 확인
        console.group('🔍 savedData 구조 상세 분석');
        console.log('savedData 전체:', savedData);
        console.log('savedData.bookingData:', savedData?.bookingData);
        if (savedData?.bookingData) {
          console.log('savedData.bookingData.mentor:', savedData.bookingData.mentor);
          console.log('savedData.bookingData.date:', savedData.bookingData.date);
          console.log('savedData.bookingData.startTime:', savedData.bookingData.startTime);
          console.log('savedData.bookingData.endTime:', savedData.bookingData.endTime);
          console.log('savedData.bookingData.serviceName:', savedData.bookingData.serviceName);
          console.log('savedData.bookingData.ticket:', savedData.bookingData.ticket);
        }
        console.groupEnd();
      } catch (e) {
        console.error('저장된 결제 데이터 파싱 실패:', e);
      }
    } else {
      console.warn('⚠️ sessionStorage에 tossPaymentData가 없습니다!');
    }
    
    // 추가: 현재 App.js에서 가지고 있는 bookingData도 확인
    console.log('📦 App.js bookingData:', bookingData);
    
    // 실제 토스 승인 API 응답 데이터 활용
    const originalResponse = tossPaymentData?.originalResponse || {};
    const paymentResponse = originalResponse.payment || originalResponse;
    const apiBookingData = tossPaymentData?.apiBookingData || {};
    const backupBookingData = tossPaymentData?.backupBookingData || null;
    
    console.log('🔍 토스 승인 API 응답 분석:', {
      originalResponse,
      paymentResponse,
      apiBookingData,
      backupBookingData,
      hasPaymentKey: !!tossPaymentData?.paymentKey,
      hasOrderId: !!tossPaymentData?.orderId,
      hasAmount: !!tossPaymentData?.amount
    });
    
    // 🔍 예약 데이터 소스 확인
    console.group('🔍 예약 데이터 소스 분석');
    console.log('bookingData (App.js):', bookingData);
    console.log('savedData?.bookingData:', savedData?.bookingData);
    console.log('backupBookingData (TossPayment에서 백업):', backupBookingData);
    console.log('API에서 온 예약 데이터:');
    console.log('  - apiBookingData.reservation:', apiBookingData.reservation);
    console.log('  - apiBookingData.booking:', apiBookingData.booking);
    console.log('  - apiBookingData.mentor:', apiBookingData.mentor);
    console.log('  - apiBookingData.ticket:', apiBookingData.ticket);
    console.log('  - originalResponse.reservation:', originalResponse.reservation);
    console.log('  - originalResponse.mentor:', originalResponse.mentor);
    console.groupEnd();
    
    // 토스 결제 데이터를 PaymentSuccess 컴포넌트가 기대하는 형태로 변환
    const formattedPaymentResult = {
      // 🔥 실제 토스 승인 API 응답 데이터 사용
      orderId: tossPaymentData?.orderId || paymentResponse?.orderId || savedData?.orderId || 'ORDER_UNKNOWN',
      amount: tossPaymentData?.amount || paymentResponse?.totalAmount || paymentResponse?.amount || savedData?.amount || 0,
      method: tossPaymentData?.method || paymentResponse?.method || '토스페이먼츠',
      approvedAt: tossPaymentData?.approvedAt || paymentResponse?.approvedAt || new Date().toISOString(),
      paymentKey: tossPaymentData?.paymentKey || paymentResponse?.paymentKey || 'N/A',
      status: tossPaymentData?.status || paymentResponse?.status || 'DONE',
      
      // 🏷️ 예약 정보 - API 응답 우선 사용
      booking: {
        mentor: {
          name: // API 응답에서 멘토 정보 먼저 확인
               apiBookingData.mentor?.name ||
               originalResponse.mentor?.name ||
               originalResponse.reservation?.mentor?.name ||
               // 🔥 올바른 경로로 수정: savedData.bookingData.mentor → savedData.bookingData.mentor
               savedData?.bookingData?.mentor?.name ||
               bookingData?.mentor?.name || 
               savedData?.customerInfo?.name || 
               '멘토 정보 없음',
          title: apiBookingData.mentor?.title ||
                apiBookingData.mentor?.specialization ||
                originalResponse.mentor?.title ||
                originalResponse.mentor?.specialization ||
                savedData?.bookingData?.mentor?.title ||
                savedData?.bookingData?.mentor?.specialization ||
                bookingData?.mentor?.title || 
                bookingData?.mentor?.specialization || 
                '전문 멘토',
          profileImage: apiBookingData.mentor?.profileImage ||
                       originalResponse.mentor?.profileImage ||
                       savedData?.bookingData?.mentor?.profileImage ||
                       bookingData?.mentor?.profileImage || 
                       null,
        },
        date: // API 응답에서 날짜 정보 먼저 확인
             apiBookingData.reservation?.date ||
             apiBookingData.booking?.date ||
             originalResponse.reservation?.date ||
             originalResponse.date ||
             // 🔥 올바른 경로로 수정
             savedData?.bookingData?.date ||
             bookingData?.date || 
             savedData?.date ||
             '날짜 미정',
        startTime: apiBookingData.reservation?.startTime ||
                  apiBookingData.booking?.startTime ||
                  originalResponse.reservation?.startTime ||
                  originalResponse.startTime ||
                  // 🔥 올바른 경로로 수정
                  savedData?.bookingData?.startTime ||
                  bookingData?.startTime || 
                  savedData?.startTime ||
                  '시간 미정',
        endTime: apiBookingData.reservation?.endTime ||
                apiBookingData.booking?.endTime ||
                originalResponse.reservation?.endTime ||
                originalResponse.endTime ||
                // 🔥 올바른 경로로 수정
                savedData?.bookingData?.endTime ||
                bookingData?.endTime || 
                savedData?.endTime ||
                '시간 미정',
        service: apiBookingData.reservation?.serviceName ||
                apiBookingData.booking?.serviceName ||
                apiBookingData.ticket?.name ||
                originalResponse.serviceName ||
                originalResponse.reservation?.serviceName ||
                // 🔥 올바른 경로로 수정
                savedData?.bookingData?.serviceName ||
                savedData?.bookingData?.ticket?.name ||
                savedData?.orderName ||
                bookingData?.serviceName || 
                bookingData?.orderName || 
                '멘토링 서비스',
        duration: apiBookingData.reservation?.duration ||
                 apiBookingData.booking?.duration ||
                 originalResponse.reservation?.duration ||
                 // 🔥 올바른 경로로 수정
                 savedData?.bookingData?.ticket?.duration ||
                 savedData?.bookingData?.duration ||
                 bookingData?.duration || 
                 savedData?.duration ||
                 null,
        meetingType: apiBookingData.reservation?.meetingType ||
                    apiBookingData.booking?.meetingType ||
                    originalResponse.reservation?.meetingType ||
                    // 🔥 올바른 경로로 수정
                    savedData?.bookingData?.meetingType ||
                    bookingData?.meetingType || 
                    savedData?.meetingType ||
                    '화상 미팅',
        location: backupBookingData?.location ||
                 apiBookingData.reservation?.location ||
                 apiBookingData.booking?.location ||
                 originalResponse.reservation?.location ||
                 savedData?.bookingData?.location ||
                 bookingData?.location || 
                 savedData?.location ||
                 null,
      },
      
      // 💰 실제 결제 금액들
      servicePrice: savedData?.bookingData?.servicePrice || bookingData?.servicePrice || tossPaymentData?.amount || 0,
      platformFee: 0, // 토스 결제에서는 별도 수수료 없음
      couponDiscount: savedData?.bookingData?.couponDiscount || bookingData?.couponDiscount || 0,
      selectedCoupon: savedData?.bookingData?.selectedCoupon || bookingData?.selectedCoupon || null,
      
      // 🔗 추가 정보
      reservationId: tossPaymentData?.reservationId || originalResponse?.reservationId || savedData?.reservationId,
      ticketId: savedData?.ticketId || bookingData?.ticketId,
      customerInfo: tossPaymentData?.customerInfo || savedData?.customerInfo,
      
      // 🐛 디버깅용 원본 데이터
      _debug: {
        tossPaymentData,
        savedData,
        bookingData,
        originalResponse
      }
    };
    
    console.log('✅ 최종 변환된 결제 결과 (실제 승인 데이터):', formattedPaymentResult);
    console.group('🔍 실제 데이터 소스 추적');
    console.log('주문번호:', formattedPaymentResult.orderId, '(소스: ' + (tossPaymentData?.orderId ? '토스승인' : savedData?.orderId ? '세션저장' : '기본값') + ')');
    console.log('결제금액:', formattedPaymentResult.amount, '(소스: ' + (tossPaymentData?.amount ? '토스승인' : savedData?.amount ? '세션저장' : '기본값') + ')');
    console.log('결제방법:', formattedPaymentResult.method);
    console.log('승인시각:', formattedPaymentResult.approvedAt);
    console.groupEnd();
    
    console.group('📋 최종 예약 정보 데이터 소스 확인');
    console.log('멘토 이름:', formattedPaymentResult.booking.mentor.name);
    console.log('  - 소스:', backupBookingData?.mentor?.name ? 'backupBookingData.mentor.name' :
                         savedData?.bookingData?.mentor?.name ? 'savedData.bookingData.mentor.name' :
                         bookingData?.mentor?.name ? 'bookingData.mentor.name' : 
                         savedData?.customerInfo?.name ? 'savedData.customerInfo.name' : '기본값');
    console.log('멘토 전문분야:', formattedPaymentResult.booking.mentor.title);
    console.log('  - 소스:', backupBookingData?.mentor?.title ? 'backupBookingData.mentor.title' :
                         savedData?.bookingData?.mentor?.title ? 'savedData.bookingData.mentor.title' :
                         bookingData?.mentor?.title ? 'bookingData.mentor.title' :
                         bookingData?.mentor?.specialization ? 'bookingData.mentor.specialization' : '기본값');
    console.log('예약 날짜:', formattedPaymentResult.booking.date);
    console.log('  - 소스:', backupBookingData?.date ? 'backupBookingData.date' :
                         savedData?.bookingData?.date ? 'savedData.bookingData.date' :
                         bookingData?.date ? 'bookingData.date' :
                         savedData?.date ? 'savedData.date' : '기본값');
    console.log('예약 시간:', `${formattedPaymentResult.booking.startTime} - ${formattedPaymentResult.booking.endTime}`);
    console.log('  - 소스:', backupBookingData?.startTime ? 'backupBookingData' :
                         savedData?.bookingData?.startTime ? 'savedData.bookingData' :
                         bookingData?.startTime ? 'bookingData' :
                         savedData?.startTime ? 'savedData' : '기본값');
    console.log('서비스명:', formattedPaymentResult.booking.service);
    console.log('  - 소스:', backupBookingData?.serviceName ? 'backupBookingData.serviceName' :
                         backupBookingData?.ticket?.name ? 'backupBookingData.ticket.name' :
                         savedData?.bookingData?.serviceName ? 'savedData.bookingData.serviceName' :
                         savedData?.bookingData?.ticket?.name ? 'savedData.bookingData.ticket.name' :
                         bookingData?.serviceName ? 'bookingData.serviceName' :
                         bookingData?.orderName ? 'bookingData.orderName' :
                         savedData?.orderName ? 'savedData.orderName' : '기본값');
    console.log('예약번호:', formattedPaymentResult.reservationId);
    console.log('티켓번호:', formattedPaymentResult.ticketId);
    console.groupEnd();
    
    // PaymentComplete 페이지로 이동
    setPaymentResult(formattedPaymentResult);
    setCurrentPage('payment-success');
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

  // 초기화 중일 때 로딩 화면 표시
  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚡</div>
        <h1 style={{ marginBottom: '16px', fontSize: '24px', color: '#374151' }}>
          MentorConnect 시작 중...
        </h1>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid #e5e7eb', 
          borderTop: '3px solid #3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

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
