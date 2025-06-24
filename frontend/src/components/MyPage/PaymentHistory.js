import React, { useState, useEffect } from 'react';
import { CreditCard, Eye, FileText } from 'lucide-react';
import { paymentAPI } from '../../services/api';
import './PaymentHistory.css';
import { Loader, AlertTriangle, Info } from 'lucide-react';

const PaymentHistory = ({ userInfo }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
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
      <div className="payment-history-container loading-container">
        <Loader className="spinner" />
        <p>결제 내역을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history-container error-container">
        <AlertTriangle />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="payment-history-container">
      <div className="payment-history-header">
        <CreditCard size={24} />
        <h2>결제 내역</h2>
      </div>

      {payments.length === 0 ? (
        <div className="no-history-container">
          <Info />
          <p>결제 내역이 없습니다.</p>
        </div>
      ) : (
        <ul className="history-list">
          {payments.map((item) => (
            <li key={item.id} className="history-item">
              <div className="item-header">
                <span className="ticket-name">{item.ticketName}</span>
                <span className={`status-badge status-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
              <div className="item-body">
                <p><strong>멘토:</strong> {item.mentorName}</p>
                <p><strong>결제 금액:</strong> {item.amount.toLocaleString()}원 ({item.originalAmount.toLocaleString()} - {item.discountAmount.toLocaleString()})</p>
                <p><strong>결제 수단:</strong> {item.paymentType}</p>
              </div>
              <div className="item-footer">
                <span>{new Date(item.approvedAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PaymentHistory;
