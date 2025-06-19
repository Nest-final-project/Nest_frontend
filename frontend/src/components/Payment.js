import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Calendar, Clock, User, Shield, CheckCircle, Gift, X } from 'lucide-react';
import './Payment.css';

const Payment = ({ bookingData, onBack, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('tosspay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // 사용 가능한 쿠폰 데이터 (실제로는 API에서 가져올 것)
  const availableCoupons = [
    {
      id: 1,
      name: '신규 회원 할인',
      discount: 5000,
      type: 'fixed', // fixed: 고정금액, percent: 퍼센트
      description: '신규 회원 전용 5,000원 할인 쿠폰',
      expiryDate: '2025-12-31',
      minAmount: 10000
    },
    {
      id: 2,
      name: '여름 시즌 특가',
      discount: 15,
      type: 'percent',
      description: '전체 서비스 15% 할인 (최대 10,000원)',
      expiryDate: '2025-08-31',
      minAmount: 15000,
      maxDiscount: 10000
    },
    {
      id: 3,
      name: '멘토링 체험권',
      discount: 3000,
      type: 'fixed',
      description: '첫 멘토링 3,000원 할인',
      expiryDate: '2025-07-31',
      minAmount: 5000
    },
    {
      id: 4,
      name: 'VIP 회원 혜택',
      discount: 20,
      type: 'percent',
      description: 'VIP 회원 전용 20% 할인 (최대 15,000원)',
      expiryDate: '2025-10-31',
      minAmount: 20000,
      maxDiscount: 15000
    }
  ];

  // 가격 정보 (서비스 시간에 따른 가격)
  const getPriceByService = (service) => {
    const prices = {
      '20분': 14900,
      '30분': 18900,
      '40분': 22900
    };
    return prices[service] || 0;
  };

  const servicePrice = getPriceByService(bookingData?.service);
  const platformFee = Math.round(servicePrice * 0.05); // 5% 플랫폼 수수료

  // 쿠폰 할인 계산
  const calculateCouponDiscount = () => {
    if (!selectedCoupon) return 0;

    if (selectedCoupon.type === 'fixed') {
      return selectedCoupon.discount;
    } else {
      const percentDiscount = Math.round(servicePrice * (selectedCoupon.discount / 100));
      return selectedCoupon.maxDiscount ?
        Math.min(percentDiscount, selectedCoupon.maxDiscount) :
        percentDiscount;
    }
  };

  const couponDiscount = calculateCouponDiscount();
  const totalPrice = servicePrice + platformFee - couponDiscount;

  // 사용 가능한 쿠폰 필터링 (최소 주문 금액 조건)
  const getUsableCoupons = () => {
    return availableCoupons.filter(coupon => servicePrice >= coupon.minAmount);
  };

  const handleCouponSelect = (coupon) => {
    setSelectedCoupon(coupon);
    setIsCouponModalOpen(false);
  };

  const handleCouponRemove = () => {
    setSelectedCoupon(null);
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // 토스페이 결제 처리 시뮬레이션
    setTimeout(() => {
      setIsProcessing(false);
      
      // 결제 완료 데이터 준비
      const paymentResult = {
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: totalPrice,
        method: '토스페이',
        approvedAt: new Date().toISOString(),
        status: 'DONE',
        booking: bookingData,
        selectedCoupon,
        servicePrice,
        platformFee,
        couponDiscount
      };
      
      // 결제 완료 페이지로 이동
      onPaymentComplete && onPaymentComplete(paymentResult);
    }, 2000);
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="icon" />
        </button>
        <h1>결제하기</h1>
      </div>

      <div className="payment-content">
        {/* 예약 정보 확인 */}
        <div className="payment-section">
          <h3><CheckCircle className="icon" /> 예약 정보 확인</h3>
          <div className="booking-summary">
            <div className="summary-item">
              <User className="summary-icon" />
              <div className="summary-info">
                <span className="summary-label">멘토</span>
                <span className="summary-value">{bookingData?.mentor?.name || '선택된 멘토'}</span>
              </div>
            </div>

            <div className="summary-item">
              <Calendar className="summary-icon" />
              <div className="summary-info">
                <span className="summary-label">날짜</span>
                <span className="summary-value">{bookingData?.date}</span>
              </div>
            </div>

            <div className="summary-item">
              <Clock className="summary-icon" />
              <div className="summary-info">
                <span className="summary-label">시간</span>
                <span className="summary-value">
                  {bookingData?.startTime} - {bookingData?.endTime}
                </span>
              </div>
            </div>

            <div className="summary-item">
              <Clock className="summary-icon" />
              <div className="summary-info">
                <span className="summary-label">서비스</span>
                <span className="summary-value">{bookingData?.service}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 결제 금액 */}
        <div className="payment-section">
          <h3>결제 금액</h3>
          <div className="price-breakdown">
            <div className="price-item">
              <span>서비스 이용료</span>
              <span>{servicePrice.toLocaleString()}원</span>
            </div>
            <div className="price-item">
              <span>플랫폼 수수료</span>
              <span>{platformFee.toLocaleString()}원</span>
            </div>
            <div className="price-divider"></div>
            <div className="price-item total">
              <span>총 결제금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* 결제 방법 선택 */}
        <div className="payment-section">
          <h3><CreditCard className="icon" /> 결제 방법</h3>
          <div className="payment-methods">
            <div className="payment-method selected">
              <div className="toss-logo">
                <div className="toss-circle"></div>
                <span className="toss-text">toss</span>
              </div>
              <span>토스페이</span>
            </div>
          </div>
          <div className="payment-info">
            <p>🔒 토스페이로 안전하고 간편하게 결제하세요</p>
            <p>• 카드, 계좌이체, 휴대폰 결제 모두 가능</p>
            <p>• 별도 앱 설치 없이 바로 결제</p>
          </div>
        </div>

        {/* 결제하기 버튼 */}
        <button
          className={`payment-button ${isProcessing ? 'processing' : ''}`}
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="spinner"></div>
              토스페이 결제 진행중...
            </>
          ) : (
            `토스페이로 ${totalPrice.toLocaleString()}원 결제하기`
          )}
        </button>
      </div>
    </div>
  );
};

export default Payment;
