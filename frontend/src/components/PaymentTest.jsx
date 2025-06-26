import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import './PaymentTest.css';

const PaymentTest = ({ onStartPayment }) => {
  const handleTestPayment = () => {
    // 테스트용 결제 데이터
    const testPaymentData = {
      mentor: {
        name: '김개발',
        profileImage: '/api/placeholder/60/60'
      },
      date: '2025-06-25',
      startTime: '14:00',
      endTime: '14:40',
      service: '40분 멘토링'
    };

    onStartPayment(testPaymentData);
  };

  const handleCompleteTest = () => {
    // URL 파라미터를 추가하여 결제 완료 페이지로 직접 이동
    const testParams = new URLSearchParams({
      paymentKey: 'test_payment_key_' + Date.now(),
      orderId: 'order_' + Date.now() + '_test',
      amount: '22900'
    });
    
    // 현재 URL에 파라미터 추가
    window.location.search = testParams.toString();
  };

  return (
    <div className="payment-test-container">
      <div className="payment-test-content">
        <div className="test-header">
          <div className="test-icon">
            <CreditCard size={60} />
          </div>
          <h1>토스페이 결제 테스트</h1>
          <p>토스페이 결제 시스템을 테스트해보세요</p>
        </div>

        <div className="test-options">
          <div className="test-card">
            <h3>🛒 전체 결제 플로우 테스트</h3>
            <p>예약 → 결제 → 완료 전체 과정을 체험해보세요</p>
            <button className="test-button primary" onClick={handleTestPayment}>
              <span>결제 플로우 시작</span>
              <ArrowRight className="button-icon" />
            </button>
          </div>

          <div className="test-card">
            <h3>✅ 결제 완료 페이지 바로 보기</h3>
            <p>결제 완료 후 화면을 바로 확인해보세요</p>
            <button className="test-button secondary" onClick={handleCompleteTest}>
              <span>완료 페이지 보기</span>
              <ArrowRight className="button-icon" />
            </button>
          </div>
        </div>

        <div className="test-info">
          <h3>📋 테스트 안내</h3>
          <ul>
            <li>실제 결제는 발생하지 않는 테스트 환경입니다</li>
            <li>토스페이먼츠 테스트 클라이언트 키를 사용합니다</li>
            <li>결제 완료 후 결제 내역 페이지도 확인할 수 있습니다</li>
            <li>모든 기능이 정상적으로 작동하는지 확인해보세요</li>
          </ul>
        </div>

        <div className="test-features">
          <h3>🚀 구현된 기능들</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">💳</div>
              <div className="feature-text">
                <h4>토스페이 결제</h4>
                <span>안전한 결제 시스템</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📄</div>
              <div className="feature-text">
                <h4>결제 완료 페이지</h4>
                <span>상세한 결제 정보</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h4>결제 내역</h4>
                <span>검색 및 필터 기능</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <div className="feature-text">
                <h4>쿠폰 시스템</h4>
                <span>할인 쿠폰 적용</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <div className="feature-text">
                <h4>반응형 디자인</h4>
                <span>모바일 최적화</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔐</div>
              <div className="feature-text">
                <h4>보안 결제</h4>
                <span>SSL 암호화</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;