import React from 'react';
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  CreditCard,
  Home,
  Receipt,
  Download
} from 'lucide-react';
import './PaymentComplete.css';

const PaymentComplete = ({paymentData, onHome, onPaymentHistory}) => {
  // 🔍 받은 데이터 구조 확인 (개발 모드에서만)
  if (import.meta.env.DEV && paymentData) {
    console.group('🔍 PaymentComplete 받은 데이터 구조');
    console.log('전체 paymentData:', paymentData);
    console.log('paymentData.data:', paymentData.data);
    console.log('paymentData.originalBookingData:',
        paymentData.originalBookingData);
    console.log('paymentData.apiBookingData:', paymentData.apiBookingData);
    // paymentResult 객체 구조도 확인 추가
    console.log('paymentData.paymentResult:', paymentData.paymentResult);
    console.log('paymentData.paymentResult?.booking:', paymentData.paymentResult?.booking);
    console.groupEnd();
  }

  const formatDate = (dateString) => {
    // 유효한 날짜 문자열이 아닐 경우 빈 문자열 반환
    if (!dateString || dateString === '날짜 미정' || dateString === '시간 미정') {
      return '';
    }
    const date = new Date(dateString);
    // Date 객체가 유효한지 확인 (Invalid Date 방지)
    if (isNaN(date.getTime())) {
      return dateString; // 유효하지 않은 날짜면 원본 문자열 반환 (디버깅 용이)
    }
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadReceipt = () => {
    if (paymentData?.paymentKey) {
      // 토스페이먼츠 영수증 URL로 이동
      window.open(
          `https://dashboard.tosspayments.com/receipt/${paymentData.paymentKey}`,
          '_blank');
    } else {
      alert('영수증을 다운로드합니다.');
    }
  };

  // 예약 정보 추출 함수
  const getBookingInfo = () => {
    if (!paymentData) {
      return {};
    }

    // 다양한 데이터 소스에서 예약 정보 추출
    // paymentData.paymentResult?.booking을 더 명시적으로 추가했습니다.
    const sources = [
      paymentData.data,
      paymentData.originalBookingData,
      paymentData.apiBookingData?.reservation,
      paymentData.apiBookingData?.booking,
      paymentData.originalResponse,
      paymentData.paymentResult?.booking // 여기에 추가
    ];

    const info = {};

    // 멘토 정보
    for (const source of sources) {
      // source?.mentor?.name이 유효하고 '멘토 정보 없음'이 아닐 때만 할당
      if (source?.mentor?.name && source.mentor.name !== '멘토 정보 없음' && !info.mentorName) {
        info.mentorName = source.mentor.name;
      }
      // 직접 mentorName 필드가 있는 경우 (예: paymentResult.booking.mentorName)
      if (source?.mentorName && source.mentorName !== '멘토 정보 없음' && !info.mentorName) {
        info.mentorName = source.mentorName;
      }
    }

    // 예약 날짜
    for (const source of sources) {
      // source?.date가 유효하고 '날짜 미정'이 아닐 때만 할당
      if (source?.date && source.date !== '날짜 미정' && !info.reservationDate) {
        info.reservationDate = source.date;
      }
      if (source?.reservationDate && source.reservationDate !== '날짜 미정' && !info.reservationDate) {
        info.reservationDate = source.reservationDate;
      }
    }

    // 예약 시간
    for (const source of sources) {
      // source?.time이 유효하고 '시간 미정'이 아닐 때만 할당
      if (source?.time && source.time !== '시간 미정' && !info.reservationTime) {
        info.reservationTime = source.time;
      }
      if (source?.reservationTime && source.reservationTime !== '시간 미정' && !info.reservationTime) {
        info.reservationTime = source.reservationTime;
      }
      // startTime과 endTime이 모두 유효하고 '시간 미정'이 아닐 때만 할당
      if (source?.startTime && source?.endTime &&
          source.startTime !== '시간 미정' && source.endTime !== '시간 미정' &&
          !info.reservationTime) {
        info.reservationTime = `${source.startTime} - ${source.endTime}`;
      }
    }

    // 서비스명 (ticketName으로 통일)
    for (const source of sources) {
      // source?.service가 유효하고 '멘토링 서비스'가 아닐 때만 할당 (기본값 제외)
      if (source?.service && source.service !== '멘토링 서비스' && !info.ticketName) {
        info.ticketName = source.service;
      }
      if (source?.serviceName && !info.ticketName) {
        info.ticketName = source.serviceName;
      }
      if (source?.orderName && !info.ticketName) {
        info.ticketName = source.orderName;
      }
      if (source?.ticket?.name && !info.ticketName) {
        info.ticketName = source.ticket.name;
      }
      if (source?.ticketName && !info.ticketName) {
        info.ticketName = source.ticketName;
      }
    }

    // 원본 금액
    for (const source of sources) {
      if (source?.servicePrice && !info.originalAmount) {
        info.originalAmount = source.servicePrice;
      }
      if (source?.originalAmount && !info.originalAmount) {
        info.originalAmount = source.originalAmount;
      }
    }

    // 할인 금액
    for (const source of sources) {
      if (source?.couponDiscount && !info.discountAmount) {
        info.discountAmount = source.couponDiscount;
      }
      if (source?.discountAmount && !info.discountAmount) {
        info.discountAmount = source.discountAmount;
      }
    }

    return info;
  };

  const bookingInfo = getBookingInfo();

  // paymentData가 없는 경우 에러 처리
  if (!paymentData) {
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
              <CheckCircle size={80}/>
            </div>
            <h1 className="success-title">결제가 완료되었습니다!</h1>
            <p className="success-subtitle">멘토링 예약이 성공적으로 완료되었습니다.</p>
          </div>

          {/* 결제 정보 카드 */}
          <div className="info-card payment-info-card">
            <div className="card-header">
              <CreditCard className="header-icon"/>
              <h3>결제 정보</h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">주문번호</span>
                  <span className="value">{paymentData.orderId}</span>
                </div>
                <div className="info-item">
                  <span className="label">결제금액</span>
                  <span className="value amount">{Number(
                      paymentData.amount).toLocaleString()}원</span>
                </div>
                <div className="info-item">
                  <span className="label">결제방법</span>
                  <span className="value">토스페이</span>
                </div>
                <div className="info-item">
                  <span className="label">결제일시</span>
                  <span className="value">{formatDate(
                      paymentData.approvedAt || new Date())}</span>
                </div>
              </div>
              <button className="receipt-button"
                      onClick={handleDownloadReceipt}>
                <Receipt className="button-icon"/>
                영수증 보기
              </button>
            </div>
          </div>

          {/* 예약 정보 카드 */}
          <div className="info-card booking-info-card">
            <div className="card-header">
              <Calendar className="header-icon"/>
              <h3>예약 정보</h3>
            </div>
            <div className="card-content">
              <div className="mentor-info">
                <div className="mentor-avatar">
                  {/* 멘토 이름이 있을 경우 첫 글자, 없으면 'M' */}
                  {bookingInfo.mentorName?.charAt(0) || 'M'}
                </div>
                <div className="mentor-details">
                  <span className="mentor-name">{bookingInfo.mentorName
                      || '멘토 정보 없음'}</span> {/* 기본값 명확히 변경 */}
                  <span className="mentor-title">시니어 개발자</span> {/* 이 부분은 bookingInfo에 없으므로 고정 */}
                </div>
              </div>
              <div className="booking-details">
                <div className="detail-item">
                  <Calendar className="detail-icon"/>
                  <span>{bookingInfo.reservationDate || '예약 날짜 미정'}</span> {/* 기본값 명확히 변경 */}
                </div>
                <div className="detail-item">
                  <Clock className="detail-icon"/>
                  <span>{bookingInfo.reservationTime || '예약 시간 미정'}</span> {/* 기본값 명확히 변경 */}
                </div>
                <div className="detail-item">
                  <User className="detail-icon"/>
                  <span>{bookingInfo.ticketName || '멘토링 서비스 미정'}</span> {/* 기본값 명확히 변경 */}
                </div>
              </div>
            </div>
          </div>

          {/* 결제 내역 상세 */}
          <div className="info-card price-detail-card">
            <div className="card-header">
              <h3>💰 결제 내역</h3>
            </div>
            <div className="card-content">
              <div className="price-breakdown">
                <div className="price-item">
                  <span>서비스 이용료</span>
                  <span>{Number(bookingInfo.originalAmount
                      || paymentData.amount).toLocaleString()}원</span>
                </div>
                {bookingInfo.discountAmount > 0 && (
                    <div className="price-item discount">
                      <span>🎫 쿠폰 할인</span>
                      <span>-{Number(
                          bookingInfo.discountAmount).toLocaleString()}원</span>
                    </div>
                )}
                <div className="price-divider"></div>
                <div className="price-item total">
                  <span>총 결제금액</span>
                  <span>{Number(paymentData.amount).toLocaleString()}원</span>
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
              <Home className="button-icon"/>
              홈으로 돌아가기
            </button>
            {onPaymentHistory && (
                <button className="secondary-button" onClick={onPaymentHistory}>
                  <Calendar className="button-icon"/>
                  내 예약 보기
                </button>
            )}
          </div>
        </div>
      </div>
  );
};

export default PaymentComplete;