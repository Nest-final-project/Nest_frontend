import React, {useEffect, useState} from 'react';
import './Payment.css';
import './TossPayment.css';

// 결제 실패 컴포넌트
function TossPaymentFail({onBack, onHome}) {
  const [errorInfo, setErrorInfo] = useState({
    code: "",
    message: "",
    orderId: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setErrorInfo({
      code: params.get("code") || "",
      message: params.get("message") || "결제 처리 중 문제가 발생했습니다.",
      orderId: params.get("orderId") || "",
    });
  }, []);

  return (
      <div className="payment-container">
        <div className="payment-header">
          <button className="back-button" onClick={onBack}>
            ← 뒤로가기
          </button>
          <h1>결제 실패</h1>
        </div>

        <div style={{
          background: "linear-gradient(90deg, #e4efe5 50%, #e1efe1 100%)",
          minHeight: "100vh",
          paddingTop: 40
        }}>
          <div style={cardStyle}>
            <div style={{textAlign: "center", marginBottom: 22}}>
              <div
                  style={{
                    width: 54,
                    height: 54,
                    margin: "0 auto 10px",
                    borderRadius: "50%",
                    background: "#faeaea",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
              >
                <svg
                    width={30}
                    height={30}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e24444"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>
              <h2 style={{fontSize: 23, fontWeight: 700, color: "#232"}}>
                결제 실패
              </h2>
              <div style={{color: "#7b868f", fontSize: 15, marginTop: 2}}>
                결제 처리 중 문제가 발생했습니다.
              </div>
            </div>
            <div style={{marginBottom: 20}}>
              {errorInfo.code && (
                  <div style={infoRow}>
                    <span>오류 코드</span>
                    <span>{errorInfo.code}</span>
                  </div>
              )}
              <div style={infoRow}>
                <span>오류 메시지</span>
                <span>{errorInfo.message}</span>
              </div>
              {errorInfo.orderId && (
                  <div style={infoRow}>
                    <span>주문ID</span>
                    <span>{errorInfo.orderId}</span>
                  </div>
              )}
            </div>
            <button
                onClick={onBack}
                style={{
                  ...buttonStyle(true),
                  background: "#15803D",
                  marginTop: 4,
                  marginBottom: 6,
                }}
            >
              다시 결제하기
            </button>
            <button
                onClick={onHome}
                style={{
                  ...buttonStyle(true),
                  background: "#ececec",
                  color: "#15803D",
                  fontWeight: 600,
                }}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
  );
}

// 스타일 정의 - Payment.js와 일치하도록 녹색 테마 적용
const cardStyle = {
  maxWidth: 600,
  margin: "0 auto",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)"
};

const buttonStyle = (primary = false) => ({
  width: "100%",
  padding: "1.25rem",
  background: primary ? "#15803D" : "#ececec",
  color: primary ? "white" : "#15803D",
  border: "none",
  borderRadius: 12,
  fontSize: "1.1rem",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: primary ? "0 4px 15px rgba(21, 128, 61, 0.3)" : "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem"
});

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #e5e7eb",
  color: "#2d3748"
};

export default TossPaymentFail;
