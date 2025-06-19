import React, { useEffect, useState } from 'react';
import { CheckCircle, Calendar, Clock, User, CreditCard, Home, Receipt, Download } from 'lucide-react';
import './PaymentComplete.css';

const PaymentComplete = ({ onHome, onPaymentHistory }) => {
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // URL 파라미터에서 결제 정보 확인
    const urlParams = new URLSearchParams(window.location.search);
    const paymentKey = urlParams.get('paymentKey');
    const orderId = urlParams.get('orderId');
    const amount = urlParams.get('amount');

    if (paymentKey && orderId && amount) {
      // 실제 결제 승인 처리 시뮬레이션
      confirmPayment(paymentKey, orderId, amount);
    } else {
      // 테스트용 데이터
      setPaymentResult({
        paymentKey: 'test_payment_key_123',
        orderId: 'order_20250619_abc123',
        amount: 22900,
        method: '토스페이',
        approvedAt: new Date().toISOString(),
        status: 'DONE',
        receiptUrl: '#',
        mentor: {
          name: '김개발',
          profileImage: '/api/placeholder/60/60'
        },
        booking: {
          date: '2025-06-25',
          startTime: '14:00',
          endTime: '14:40',
          service: '40분 멘토링'
        }
      });
      setLoading(false);
    }
  }, []);

  const confirmPayment = async (paymentKey, orderId, amount) => {
    try {
      // 여기서 실제 백엔드 API 호출
      // const response = await paymentAPI.confirmPayment({ paymentKey, orderId, amount });
      
      // 시뮬레이션된 응답
      setTimeout(() => {
        setPaymentResult({
          paymentKey,
          orderId,
          amount: parseInt(amount),
          method: '토스페이',
          approvedAt: new Date().toISOString(),
          status: 'DONE',
          receiptUrl: `https://dashboard.tosspayments.com/receipt/${paymentKey}`,
          mentor: {
            name: '김개발',
            profileImage: '/api/placeholder/60/60'
          },
          booking: {
            date: '2025-06-25',
            startTime: '14:00',
            endTime: '14:40',
            service: '40분 멘토링'
          }
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('결제 승인 오류:', error);
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (paymentResult?.receiptUrl) {
      window.open(paymentResult.receiptUrl, '_blank');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="payment-complete-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <h2>결제 승인을 처리하고 있습니다...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (!paymentResult) {
    return (
      <div className="payment-complete-container">
        <div className="error-section">
          <h2>결제 정보를 찾을 수 없습니다</h2>
          <button onClick={onHome} className="home-button">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-complete-container">
      <div className="payment-complete-content">
        {/* 성공 아이콘 및 메시지 */}
        <div className="success-header">
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>
          <h1 className="success-title">결제가 완료되었습니다!</h1>
          <p className="success-subtitle">멘토링 예약이 성공적으로 완료되었습니다.</p>
        </div>

        {/* 결제 정보 카드 */}
        <div className="info-card payment-info-card">
          <div className="card-header">
            <CreditCard className="header-icon" />
            <h3>결제 정보</h3>
          </div>
          <div className="card-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">주문번호</span>
                <span className="value">{paymentResult.orderId}</span>
              </div>
              <div className="info-item">
                <span className="label">결제금액</span>
                <span className="value amount">{paymentResult.amount.toLocaleString()}원</span>
              </div>
              <div className="info-item">
                <span className="label">결제방법</span>
                <span className="value">{paymentResult.method}</span>
              </div>
              <div className="info-item">
                <span className="label">결제일시</span>
                <span className="value">{formatDate(paymentResult.approvedAt)}</span>
              </div>
            </div>
            <button className="receipt-button" onClick={handleDownloadReceipt}>
              <Receipt className="button-icon" />
              영수증 보기
            </button>
          </div>
        </div>

        {/* 예약 정보 카드 */}
        <div className="info-card booking-info-card">
          <div className="card-header">
            <Calendar className="header-icon" />
            <h3>예약 정보</h3>
          </div>
          <div className="card-content">
            <div className="mentor-info">
              <img 
                src={paymentResult.mentor.profileImage} 
                alt={paymentResult.mentor.name}
                className="mentor-avatar"
              />
              <div className="mentor-details">
                <span className="mentor-name">{paymentResult.mentor.name}</span>
                <span className="mentor-title">시니어 개발자</span>
              </div>
            </div>
            <div className="booking-details">
              <div className="detail-item">
                <Calendar className="detail-icon" />
                <span>{paymentResult.booking.date}</span>
              </div>
              <div className="detail-item">
                <Clock className="detail-icon" />
                <span>{paymentResult.booking.startTime} - {paymentResult.booking.endTime}</span>
              </div>
              <div className="detail-item">
                <User className="detail-icon" />
                <span>{paymentResult.booking.service}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 안내사항 */}
        <div className="info-card notice-card">
          <div className="card-header">
            <h3>📋 안내사항</h3>
          </div>
          <div className="card-content">
            <ul className="notice-list">
              <li>
                <strong>화상회의 링크</strong>는 멘토링 시작 10분 전에 이메일과 SMS로 발송됩니다.
              </li>
              <li>
                <strong>예약 취소</strong>는 멘토링 시작 2시간 전까지 가능하며, 취소 시 전액 환불됩니다.
              </li>
              <li>
                멘토링 진행 중 기술적 문제가 발생하면 <strong>고객센터 1588-1234</strong>로 연락주세요.
              </li>
              <li>
                멘토링 완료 후 <strong>리뷰 작성</strong>하시면 다음 멘토링에서 사용할 수 있는 쿠폰을 드립니다.
              </li>
            </ul>
          </div>
        </div>

        {/* 다음 단계 안내 */}
        <div className="next-steps">
          <h3>🚀 다음 단계</h3>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>준비하기</h4>
                <p>멘토링 전 질문을 미리 준비해보세요</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>참여하기</h4>
                <p>시간에 맞춰 화상회의에 참여하세요</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>리뷰하기</h4>
                <p>멘토링 후 소중한 후기를 남겨주세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="action-buttons">
          <button onClick={onHome} className="home-button primary">
            <Home className="button-icon" />
            홈으로 돌아가기
          </button>
          <button className="secondary-button" onClick={onPaymentHistory}>
            <Calendar className="button-icon" />
            내 예약 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentComplete;