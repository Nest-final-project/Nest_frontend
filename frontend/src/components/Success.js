import React, { useEffect, useState } from 'react';
import { CheckCircle, Calendar, Clock, User, Home } from 'lucide-react';
import { paymentAPI } from '../services/api';
import './Success.css';

const Success = ({ paymentData, onHome }) => {
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // URL 파라미터에서 결제 정보 확인
    const urlParams = new URLSearchParams(window.location.search);
    const paymentKey = urlParams.get('paymentKey');
    const orderId = urlParams.get('orderId');
    const amount = urlParams.get('amount');

    if (paymentKey && orderId && amount) {
      // 결제 승인 처리
      confirmPayment(paymentKey, orderId, amount);
    } else {
      // URL에 결제 정보가 없으면 paymentData 사용
      setPaymentResult(paymentData);
      setLoading(false);
    }
  }, [paymentData]);

  const confirmPayment = async (paymentKey, orderId, amount) => {
    try {
      // 백엔드 서버에서 결제 승인 처리
      const response = await paymentAPI.confirmPayment({
        paymentKey,
        orderId,
        amount: parseInt(amount)
      });

      if (response.data) {
        setPaymentResult(response.data);
      } else {
        throw new Error('결제 승인 실패');
      }
    } catch (error) {
      console.error('결제 승인 오류:', error);
      // 오류 발생 시 기본 정보로 표시
      setPaymentResult({
        orderId,
        amount: parseInt(amount),
        approvedAt: new Date().toISOString(),
        method: '카드',
        status: 'DONE'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="success-container">
        <div className="success-loading">
          <div className="loading-spinner"></div>
          <p>결제 승인을 처리하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="success-container">
      <div className="success-content">
        <div className="success-icon">
          <CheckCircle size={80} />
        </div>
        
        <h1 className="success-title">결제가 완료되었습니다!</h1>
        <p className="success-subtitle">멘토링 예약이 성공적으로 완료되었습니다.</p>

        {/* 결제 정보 */}
        <div className="success-section">
          <h3>결제 정보</h3>
          <div className="success-info">
            <div className="info-row">
              <span className="label">주문번호</span>
              <span className="value">{paymentResult?.orderId || paymentData?.orderId}</span>
            </div>
            <div className="info-row">
              <span className="label">결제금액</span>
              <span className="value price">
                {(paymentResult?.amount || paymentData?.amount)?.toLocaleString()}원
              </span>
            </div>
            <div className="info-row">
              <span className="label">결제방법</span>
              <span className="value">{paymentResult?.method || '카드'}</span>
            </div>
            <div className="info-row">
              <span className="label">결제일시</span>
              <span className="value">
                {paymentResult?.approvedAt 
                  ? new Date(paymentResult.approvedAt).toLocaleString()
                  : new Date().toLocaleString()
                }
              </span>
            </div>
          </div>
        </div>

        {/* 예약 정보 */}
        {paymentData && (
          <div className="success-section">
            <h3>예약 정보</h3>
            <div className="booking-info">
              <div className="info-row">
                <span className="label">멘토</span>
                <span className="value">{paymentData.mentor?.name}</span>
              </div>
              <div className="info-row">
                <span className="label">일시</span>
                <span className="value">
                  {paymentData.date} {paymentData.startTime} - {paymentData.endTime}
                </span>
              </div>
              <div className="info-row">
                <span className="label">서비스</span>
                <span className="value">{paymentData.service}</span>
              </div>
            </div>
          </div>
        )}

        {/* 안내사항 */}
        <div className="success-section notice">
          <h3>안내사항</h3>
          <ul className="notice-list">
            <li>멘토링 시작 10분 전까지 화상회의 링크를 이메일로 발송해드립니다.</li>
            <li>예약 취소는 멘토링 시작 2시간 전까지 가능합니다.</li>
            <li>문의사항이 있으시면 고객센터로 연락해주세요.</li>
          </ul>
        </div>

        <button className="home-button" onClick={onHome}>
          <Home className="button-icon" />
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default Success;
