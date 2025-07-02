import React, { useState, useEffect } from 'react';
import { CreditCard, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { paymentAPI } from '../../services/api';
import './PaymentHistory.css';
import { Loader, AlertTriangle, Info } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentHistory = ({ userInfo }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  useEffect(() => {
    // URL 파라미터에서 현재 페이지를 가져옵니다.
    const pageFromUrl = parseInt(searchParams.get('page') || '0', 10);
    // currentPage 상태를 URL 파라미터와 동기화
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [searchParams]); // URL 파라미터가 변경될 때마다 실행

  useEffect(() => {
    // 멘티일 경우에만 결제 내역을 불러옴
    if (userInfo?.userRole === 'MENTEE') {
      const fetchPayments = async (page) => {
        try {
          setLoading(true);
          const response = await paymentAPI.getPaymentHistory({
            page: page,
            size: 10,
          });

          const responseData = response.data.data;

          setPayments(responseData.content || []);
          setTotalPages(responseData.totalPages);
          setTotalElements(responseData.totalElements);
          setHasNext(responseData.hasNext);
          setHasPrevious(responseData.hasPrevious);

        } catch (err) {
          console.error("결제 내역을 불러오는 데 실패했습니다:", err);
          setError("결제 내역을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
        } finally {
          setLoading(false);
        }
      };

      fetchPayments(currentPage);
    } else {
      // 멘티가 아니면 로딩을 멈추고 빈 화면을 보여줌
      setLoading(false);
    }
  }, [userInfo, currentPage]); // userInfo가 변경될 때만 실행

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('page', newPage.toString());
      setSearchParams(newSearchParams);
    }
  };

  // 페이지 번호 생성 로직
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // 총 페이지가 5개 이하면 모두 표시
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 총 페이지가 5개 초과면 현재 페이지 기준으로 표시
      let startPage = Math.max(0, currentPage - 2);
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  // 멘티가 아닌 경우 아무것도 렌더링하지 않음
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
            // === 여기부터 수정 시작 ===
            <> {/* <-- payments.length === 0 조건의 else 블록 시작에 Fragment 열기 */}
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

              {/* 고급스러운 페이지네이션 */}
              {totalPages > 1 && (
                  <div className="pagination-wrapper">
                    <div className="pagination-container">
                      {/* 이전 페이지 버튼 */}
                      <button
                          className={`pagination-btn prev-btn ${!hasPrevious ? 'disabled' : ''}`}
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!hasPrevious}
                      >
                        <ChevronLeft size={18} />
                        <span>이전</span>
                      </button>

                      {/* 페이지 번호들 */}
                      <div className="pagination-numbers">
                        {/* 첫 페이지로 가는 버튼 (현재 페이지가 3 이상일 때만) */}
                        {currentPage > 2 && totalPages > 5 && (
                            <>
                              <button
                                  className="pagination-number"
                                  onClick={() => handlePageChange(0)}
                              >
                                1
                              </button>
                              {currentPage > 3 && <span className="pagination-ellipsis">...</span>}
                            </>
                        )}

                        {/* 메인 페이지 번호들 */}
                        {generatePageNumbers().map(pageNum => (
                            <button
                                key={pageNum}
                                className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                                onClick={() => {
                                  console.log('버튼 클릭!')
                                  handlePageChange(pageNum)
                                }}
                            >
                              {pageNum + 1}
                            </button>
                        ))}

                        {/* 마지막 페이지로 가는 버튼 (현재 페이지가 끝에서 3번째 이전일 때만) */}
                        {currentPage < totalPages - 3 && totalPages > 5 && (
                            <>
                              {currentPage < totalPages - 4 && <span className="pagination-ellipsis">...</span>}
                              <button
                                  className="pagination-number"
                                  onClick={() => handlePageChange(totalPages - 1)}
                              >
                                {totalPages}
                              </button>
                            </>
                        )}
                      </div>

                      {/* 다음 페이지 버튼 */}
                      <button
                          className={`pagination-btn next-btn ${!hasNext ? 'disabled' : ''}`}
                          onClick={() => {
                            console.log('버튼 클릭!')
                            handlePageChange(currentPage + 1)
                          }}
                          disabled={!hasNext}
                      >
                        <span>다음</span>
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    {/* 페이지 정보 */}
                    <div className="pagination-info">
              <span>
                {currentPage + 1} / {totalPages} 페이지
                <span className="total-items">
                  (총 {totalElements.toLocaleString()}개)
                </span>
              </span>
                    </div>
                  </div>
              )}
            </>
          )}
      </div>
  );
};

export default PaymentHistory;
