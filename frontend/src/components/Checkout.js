import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import './Checkout.css';

const Checkout = ({ paymentData, onBack, onSuccess, onFail }) => {
  const paymentWidgetRef = useRef(null);
  const paymentMethodsWidgetRef = useRef(null);

  useEffect(() => {
    async function loadTossPayments() {
      try {
        // 토스페이먼츠 SDK 로드
        const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');

        // 클라이언트 키 (실제 프로덕션에서는 환경변수로 관리)
        const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
        const tossPayments = await loadTossPayments(clientKey);

        // 결제 위젯 초기화
        const paymentWidget = tossPayments.widgets({
          customerKey: `customer_${Date.now()}`,
        });

        // 결제 금액 설정
        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
            '#payment-methods',
            { value: paymentData.amount },
        );

        // 이용약관 위젯
        paymentWidget.renderAgreement('#agreement');

        paymentWidgetRef.current = paymentWidget;
        paymentMethodsWidgetRef.current = paymentMethodsWidget;

      } catch (error) {
        console.error('토스페이먼츠 로드 실패:', error);
        alert('결제 시스템을 불러오는데 실패했습니다.');
      }
    }

    if (paymentData) {
      loadTossPayments();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (paymentWidgetRef.current) {
        // 위젯 정리 로직이 있다면 여기에 추가
      }
    };
  }, [paymentData]);

  const handlePayment = async () => {
    if (!paymentWidgetRef.current) {
      alert('결제 시스템이 준비되지 않았습니다.');
      return;
    }

    try {
      // 결제 요청
      await paymentWidgetRef.current.requestPayment({
        orderId: paymentData.orderId,
        orderName: paymentData.orderName,
        customerName: paymentData.customer.name,
        customerEmail: paymentData.customer.email,
        customerMobilePhone: paymentData.customer.phone,
        successUrl: `${window.location.origin}/?success=true`,
        failUrl: `${window.location.origin}/?fail=true`,
      });
    } catch (error) {
      console.error('결제 요청 실패:', error);
      if (error.code === 'USER_CANCEL') {
        // 사용자가 결제를 취소한 경우
        return;
      }
      alert('결제 요청 중 오류가 발생했습니다.');
    }
  };

  if (!paymentData) {
    return (
        <div className="checkout-container">
          <div className="checkout-loading">
            결제 정보를 불러오는 중...
          </div>
        </div>
    );
  }

  return (
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft className="icon" />
          </button>
          <h1>토스페이 결제</h1>
        </div>

        <div className="checkout-content">
          {/* 주문 정보 */}
          <div className="checkout-section">
            <h3>주문 정보</h3>
            <div className="order-info">
              <div className="info-row">
                <span className="label">주문명</span>
                <span className="value">{paymentData.orderName}</span>
              </div>
              <div className="info-row">
                <span className="label">결제 금액</span>
                <span className="value price">{paymentData.amount.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="checkout-section">
            <h3>주문자 정보</h3>
            <div className="customer-info">
              <div className="info-row">
                <span className="label">이름</span>
                <span className="value">{paymentData.customer.name}</span>
              </div>
              <div className="info-row">
                <span className="label">이메일</span>
                <span className="value">{paymentData.customer.email}</span>
              </div>
              <div className="info-row">
                <span className="label">전화번호</span>
                <span className="value">{paymentData.customer.phone}</span>
              </div>
            </div>
          </div>

          {/* 토스페이먼츠 결제 위젯 */}
          <div className="checkout-section">
            <h3>결제수단</h3>
            <div id="payment-methods"></div>
          </div>

          {/* 이용약관 */}
          <div className="checkout-section">
            <div id="agreement"></div>
          </div>

          <button className="checkout-button" onClick={handlePayment}>
            결제하기
          </button>
        </div>
      </div>
  );
};

export default Checkout;
