import React, { useState, useEffect } from 'react';
import { CreditCard, Eye, FileText } from 'lucide-react';
import { paymentAPI } from '../../services/api';

const PaymentHistory = ({ userInfo }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (userInfo?.userRole === 'MENTEE' && !dataLoaded) {
      fetchPayments();
    }
  }, [userInfo, dataLoaded]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentAPI.getPaymentHistory();
      const fetchedPayments = response.data.data.content;
      setPayments(fetchedPayments);
      setDataLoaded(true);
    } catch (err) {
      console.error("결제 내역을 불러오는 데 실패했습니다:", err);
      setError("결제 내역을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setDataLoaded(false);
    setError(null);
    fetchPayments();
  };

  // 멘티가 아닌 경우 렌더링하지 않음
  if (userInfo?.userRole !== 'MENTEE') {
    return null;
  }

  if (loading) {
    return (
      <div className="payments-tab">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>결제 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payments-tab">
        <div className="error-state">
          <CreditCard className="error-icon" />
          <h4>오류가 발생했습니다</h4>
          <p>{error}</p>
          <button className="retry-btn" onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-tab">
      <div className="section-header">
        <h3>결제 내역</h3>
        <p>멘토링 결제 및 환불 내역을 확인하세요</p>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <CreditCard className="empty-icon" />
          <h4>아직 결제 내역이 없습니다</h4>
          <p>멘토링을 예약하고 결제해보세요!</p>
        </div>
      ) : (
        <div className="payments-scroll-container">
          <div className="payments-container">
            {payments.map((payment) => (
              <div key={payment.id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-title">
                    <h4>{payment.ticketName}</h4>
                    <span
                      className={`payment-status-badge ${payment.status?.toLowerCase()}`}
                    >
                      {payment.status === 'DONE' ? '결제완료' :
                       payment.status === 'CANCELLED' ? '결제취소' :
                       payment.status === 'REFUNDED' ? '환불완료' :
                       payment.status === 'PENDING' ? '결제대기' : '완료'}
                    </span>
                  </div>
                  <div className="payment-amount">
                    {payment.status === 'REFUNDED' ? '-' : ''}₩{payment.amount.toLocaleString()}
                  </div>
                </div>

                <div className="payment-body">
                  <div className="payment-info">
                    <div className="payment-info-row">
                      <span className="payment-info-label">멘토</span>
                      <span className="payment-info-value">{payment.mentorName}</span>
                    </div>
                    <div className="payment-info-row">
                      <span className="payment-info-label">결제타입</span>
                      <span className="payment-info-value">{payment.paymentType}</span>
                    </div>
                    {payment.approvedAt && (
                      <div className="payment-info-row">
                        <span className="payment-info-label">승인일시</span>
                        <span className="payment-info-value">
                          {new Date(payment.approvedAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="payment-date-section">
                    <div className="payment-date-item">
                      <CreditCard className="payment-date-icon" />
                      <div className="payment-date-details">
                        <div className="payment-date-label">
                          {payment.status === 'REFUNDED' ? '환불일시' : '결제일시'}
                        </div>
                        <div className="payment-date-value">
                          {new Date(payment.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </div>
                        <div className="payment-time-value">
                          {new Date(payment.createdAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="payment-actions">
                  <button className="action-btn outline">
                    <Eye size={16} />
                    상세보기
                  </button>
                  {payment.status === 'DONE' && (
                    <button className="action-btn secondary">
                      <FileText size={16} />
                      영수증
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="scroll-guide">
            <span>더 많은 결제 내역을 보려면 스크롤하세요</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
