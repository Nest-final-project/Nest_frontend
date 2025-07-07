import React, { useEffect, useState } from 'react';
import { XCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import './Fail.css';

const Fail = ({ onBack, onHome }) => {
  const [failureInfo, setFailureInfo] = useState({
    code: '',
    message: ''
  });

  useEffect(() => {
    // URL 파라미터에서 실패 정보 확인
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const message = urlParams.get('message');

    if (code && message) {
      setFailureInfo({
        code: decodeURIComponent(code),
        message: decodeURIComponent(message)
      });
    } else {
      // 기본 실패 메시지
      setFailureInfo({
        code: 'PAYMENT_FAILED',
        message: '결제 처리 중 오류가 발생했습니다.'
      });
    }
  }, []);

  const getFailureMessage = (code) => {
    const messages = {
      'USER_CANCEL': '사용자가 결제를 취소했습니다.',
      'INVALID_CARD': '유효하지 않은 카드입니다.',
      'INSUFFICIENT_FUNDS': '잔액이 부족합니다.',
      'EXCEED_MAX_DAILY_PAYMENT_COUNT': '일일 결제 한도를 초과했습니다.',
      'EXCEED_MAX_ONE_DAY_PAYMENT_AMOUNT': '일일 결제 금액을 초과했습니다.',
      'CARD_PROCESSING_ERROR': '카드사에서 승인을 거절했습니다.',
      'PAYMENT_FAILED': '결제 처리 중 오류가 발생했습니다.',
      'NETWORK_ERROR': '네트워크 오류가 발생했습니다.'
    };

    return messages[code] || failureInfo.message || '알 수 없는 오류가 발생했습니다.';
  };

  const getSolution = (code) => {
    const solutions = {
      'USER_CANCEL': '결제를 다시 시도해주세요.',
      'INVALID_CARD': '다른 카드로 결제를 시도하거나 카드 정보를 확인해주세요.',
      'INSUFFICIENT_FUNDS': '카드 잔액을 확인하고 다시 시도해주세요.',
      'EXCEED_MAX_DAILY_PAYMENT_COUNT': '내일 다시 시도하거나 다른 카드를 사용해주세요.',
      'EXCEED_MAX_ONE_DAY_PAYMENT_AMOUNT': '결제 금액을 줄이거나 다른 카드를 사용해주세요.',
      'CARD_PROCESSING_ERROR': '카드사에 문의하거나 다른 카드로 시도해주세요.',
      'PAYMENT_FAILED': '잠시 후 다시 시도해주세요.',
      'NETWORK_ERROR': '인터넷 연결을 확인하고 다시 시도해주세요.'
    };

    return solutions[code] || '고객센터로 문의해주세요.';
  };

  return (
    <div className="fail-container">
      <div className="fail-content">
        <div className="fail-icon">
          <XCircle size={80} />
        </div>
        
        <h1 className="fail-title">결제에 실패했습니다</h1>
        <p className="fail-subtitle">{getFailureMessage(failureInfo.code)}</p>

        {/* 오류 정보 */}
        <div className="fail-section">
          <h3>오류 정보</h3>
          <div className="fail-info">
            <div className="info-row">
              <span className="label">오류 코드</span>
              <span className="value error-code">{failureInfo.code}</span>
            </div>
            <div className="info-row">
              <span className="label">발생 시간</span>
              <span className="value">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 해결방법 */}
        <div className="fail-section solution">
          <h3>해결방법</h3>
          <p className="solution-text">{getSolution(failureInfo.code)}</p>
          
          <div className="solution-tips">
            <h4>결제 실패 시 확인사항</h4>
            <ul>
              <li>카드 유효기간 및 정보가 정확한지 확인</li>
              <li>카드 한도 및 잔액 확인</li>
              <li>해외 결제 차단 여부 확인</li>
              <li>인터넷 연결 상태 확인</li>
            </ul>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="fail-actions">
          <button className="retry-button" onClick={onBack}>
            <RefreshCw className="button-icon" />
            다시 시도하기
          </button>
          
          <button className="home-button" onClick={onHome}>
            <Home className="button-icon" />
            홈으로 돌아가기
          </button>
        </div>

        {/* 고객센터 정보 */}
        <div className="fail-section contact">
          <h3>고객센터</h3>
          <p>결제 관련 문의사항이 있으시면 언제든지 연락해주세요.</p>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-label">전화:</span>
              <span className="contact-value">1588-1234</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">이메일:</span>
              <span className="contact-value">support@example.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">운영시간:</span>
              <span className="contact-value">평일 09:00 - 18:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fail;
