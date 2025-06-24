 import React, {useEffect, useState} from "react";
import './Payment.css'; // 기존 CSS 스타일 사용
import './TossPayment.css'; // 토스 전용 CSS 추가

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Payment.css의 스타일 클래스를 사용하므로 인라인 스타일 제거

function TossPaymentComponent({
    bookingData,
    onBack,
    onTossSuccess,
    onTossFail,
    onHome
}) {
    const [payment, setPayment] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // ❌ 하드코딩 제거: bookingData 없으면 에러 처리
    const [amount, setAmount] = useState(0);
    const [orderName, setOrderName] = useState("");
    const [customerInfo, setCustomerInfo] = useState({
        email: "",
        name: "",
        phone: "",
    });
    
    // 초기 검증: bookingData 필수
    useEffect(() => {
        if (!bookingData) {
            alert("예약 정보가 없습니다. 다시 시도해주세요.");
            onBack();
            return;
        }
        
        // 필수 필드 검증
        if (!bookingData.servicePrice && !bookingData.totalPrice) {
            alert("결제 금액 정보가 없습니다. 다시 예약해주세요.");
            onBack();
            return;
        }
        
        if (!bookingData.serviceName && !bookingData.orderName) {
            alert("상품 정보가 없습니다. 다시 예약해주세요.");
            onBack();
            return;
        }
        
        console.log('✅ bookingData 검증 완료:', bookingData);
    }, [bookingData, onBack]);

    // SDK 로드
    useEffect(() => {
        const loadTossPayments = () => {
            return new Promise((resolve, reject) => {
                if (window.TossPayments) {
                    resolve(window.TossPayments);
                    return;
                }
                const script = document.createElement("script");
                script.src = "https://js.tosspayments.com/v2/standard";
                script.onload = () => resolve(window.TossPayments);
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };

        loadTossPayments()
            .then(TossPayments => {
                const clientKey = "test_ck_DpexMgkW3679zj5XY0PJVGbR5ozO";
                const instance = TossPayments(clientKey);
                const paymentInstance = instance.payment({
                    customerKey: generateCustomerKey(),
                });
                setPayment(paymentInstance);
            })
            .catch(() => {
                alert("결제 시스템 로드 실패. 새로고침해주세요.");
            });
    }, []);

    // bookingData가 변경되면 폼 데이터 업데이트
    useEffect(() => {
        if (bookingData) {
            console.log('📦 받은 bookingData:', bookingData);
            
            // ❌ 하드코딩 제거: DB 값만 사용
            const dbAmount = bookingData.servicePrice || bookingData.totalPrice;
            const dbOrderName = bookingData.serviceName || bookingData.orderName;
            
            if (!dbAmount) {
                console.error('❌ DB에서 금액 정보를 찾을 수 없습니다:', bookingData);
                alert('결제 금액 정보가 없습니다. 다시 예약해주세요.');
                onBack();
                return;
            }
            
            if (!dbOrderName) {
                console.error('❌ DB에서 상품명 정보를 찾을 수 없습니다:', bookingData);
                alert('상품 정보가 없습니다. 다시 예약해주세요.');
                onBack();
                return;
            }
            
            setAmount(dbAmount);
            setOrderName(dbOrderName);
            setCustomerInfo({
                email: bookingData.customer?.email || "",
                name: bookingData.customer?.name || "",
                phone: bookingData.customer?.phone || "",
            });
            
            console.log('✅ DB 데이터로 폼 업데이트:', {
                amount: dbAmount,
                orderName: dbOrderName,
                customer: bookingData.customer
            });
        }
    }, [bookingData, onBack]);

    // 전화번호 유효성 검사
    const isValidPhone = (phone) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 11 &&
               (cleanPhone.startsWith('010') || cleanPhone.startsWith('011') ||
                cleanPhone.startsWith('016') || cleanPhone.startsWith('017') ||
                cleanPhone.startsWith('018') || cleanPhone.startsWith('019'));
    };

    // 전화번호 포맷팅 함수
    const formatPhoneNumber = (value) => {
        // 숫자만 추출
        const numbers = value.replace(/[^0-9]/g, '');

        // 11자리로 제한
        const limited = numbers.slice(0, 11);

        // 포맷팅 (010-1234-5678)
        if (limited.length <= 3) {
            return limited;
        } else if (limited.length <= 7) {
            return `${limited.slice(0, 3)}-${limited.slice(3)}`;
        } else {
            return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
        }
    };

    // 전화번호 입력 핸들러
    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setCustomerInfo({...customerInfo, phone: formatted});
    };

    const generateCustomerKey = () => "customer_" + Math.random().toString(36).slice(2, 11);

    const generateOrderId = () => "ORDER_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

    const requestPayment = async () => {
        if (!payment) return alert("결제 시스템 준비 중입니다.");
        
        // ❌ 하드코딩 방지: 모든 값이 DB에서 와야 함
        if (!amount || amount <= 0) {
            alert("결제 금액이 올바르지 않습니다. 다시 예약해주세요.");
            return;
        }
        
        if (!orderName || orderName.trim() === "") {
            alert("상품명이 없습니다. 다시 예약해주세요.");
            return;
        }
        
        if (!customerInfo.email || !customerInfo.name || !customerInfo.phone) {
            return alert("고객 정보를 모두 입력해주세요.");
        }

        // 전화번호 유효성 검사
        const cleanPhone = customerInfo.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            return alert("전화번호는 10-11자리 숫자여야 합니다.");
        }

        if (!cleanPhone.startsWith('010') && !cleanPhone.startsWith('011') &&
            !cleanPhone.startsWith('016') && !cleanPhone.startsWith('017') &&
            !cleanPhone.startsWith('018') && !cleanPhone.startsWith('019')) {
            return alert("올바른 휴대폰 번호를 입력해주세요.");
        }

        setIsLoading(true);
        console.log('🚀 토스 결제 요청 시작 (DB 데이터만 사용)');
        console.log('💳 결제 정보 (모든 값이 DB에서 전달됨):', {
            amount: amount,
            orderName: orderName,
            customerInfo: {...customerInfo, phone: cleanPhone},
            bookingData: {
                reservationId: bookingData?.reservationId,
                ticketId: bookingData?.ticketId,
                selectedCoupon: bookingData?.selectedCoupon
            }
        });

        try {
            const orderId = generateOrderId();
            
            // ❌ 하드코딩 방지: 필수 데이터 검증
            if (!bookingData?.reservationId && !bookingData?.reservation?.id) {
                throw new Error("예약 정보가 없습니다. 다시 예약해주세요.");
            }
            
            if (!bookingData?.ticketId && !bookingData?.ticket?.id) {
                throw new Error("티켓 정보가 없습니다. 다시 선택해주세요.");
            }
            
            const reservationId = bookingData.reservationId || bookingData.reservation?.id;
            const ticketId = bookingData.ticketId || bookingData.ticket?.id;

            console.log('📋 결제 파라미터:', {
                orderId,
                reservationId: Number(reservationId),
                ticketId: Number(ticketId),
                amount: Number(amount),
                orderName,
                cleanPhone
            });
            
            // 🔥 1. 먼저 결제 준비 API 호출
            const tokenFromStorage = localStorage?.getItem("accessToken") || sessionStorage?.getItem("accessToken");
            if (!tokenFromStorage) {
                throw new Error("로그인이 필요합니다.");
            }
            
            console.log('📞 결제 준비 API 호출 시작');
            const prepareResponse = await fetch(`${BASE_URL}/api/v1/payments/prepare`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenFromStorage}`,
                },
                body: JSON.stringify({
                    reservationId: Number(reservationId),
                    ticketId: Number(ticketId),
                    amount: Number(amount),
                    couponId: bookingData?.selectedCoupon?.id ? Number(bookingData.selectedCoupon.id) : null
                }),
            });
            
            if (!prepareResponse.ok) {
                const errorText = await prepareResponse.text();
                console.error('❌ 결제 준비 실패:', {
                    status: prepareResponse.status,
                    statusText: prepareResponse.statusText,
                    body: errorText
                });
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { message: errorText || "결제 준비 실패" };
                }
                
                throw new Error(errorData.message || `HTTP ${prepareResponse.status}: 결제 준비 실패`);
            }
            
            const prepareData = await prepareResponse.json();
            console.log('✅ 결제 준비 완료:', prepareData);

            // 결제 데이터를 sessionStorage에 임시 저장
            const paymentData = {
                orderId,
                amount: Number(amount),
                reservationId: Number(reservationId),
                ticketId: Number(ticketId),
                orderName,
                customerInfo: {
                    ...customerInfo,
                    phone: cleanPhone // 정리된 전화번호 저장
                },
                bookingData
            };
            sessionStorage.setItem('tossPaymentData', JSON.stringify(paymentData));

            // 토스페이먼츠에서 요구하는 정확한 URL 형식 사용
            const baseUrl = window.location.origin;
            const successUrl = `${baseUrl}/toss/success`;
            const failUrl = `${baseUrl}/toss/fail`;

            console.log('🔗 결제 URL:', {successUrl, failUrl});

            await payment.requestPayment({
                method: "CARD",
                amount: {
                    currency: "KRW",
                    value: amount,
                },
                orderId,
                orderName,
                successUrl,
                failUrl,
                customerEmail: customerInfo.email,
                customerName: customerInfo.name,
                customerMobilePhone: cleanPhone, // 숫자만 포함된 전화번호 사용
            });
        } catch (error) {
            console.error('❌ 토스 결제 오류:', error);
            if (error.code === "USER_CANCEL") {
                alert("결제가 취소되었습니다.");
            } else {
                alert("결제 요청 오류: " + (error.message || "알 수 없음"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="payment-container">
            {/* Payment.css 스타일 클래스 사용 */}
            <div className="payment-header">
                <button className="back-button" onClick={onBack}>
                    ← 뒤로가기
                </button>
                <h1>토스 결제</h1>
            </div>

            <div className="payment-content">
                <div className="payment-section">
                    <h2 className="toss-payment-title">
                        토스 결제
                    </h2>
                    <form
                        className="toss-payment-form"
                        onSubmit={e => {
                            e.preventDefault();
                            requestPayment();
                        }}
                    >
                        {/* 예약 정보 표시 (bookingData가 있는 경우) */}
                        {bookingData && (
                            <div className="payment-section">
                                <h3>📋 예약 정보</h3>
                                <div className="booking-summary">
                                    {bookingData.mentor?.name && (
                                        <div className="summary-item">
                                            <span className="summary-label">👤 멘토</span>
                                            <span className="summary-value">{bookingData.mentor.name}</span>
                                        </div>
                                    )}
                                    {bookingData.date && (
                                        <div className="summary-item">
                                            <span className="summary-label">📅 날짜</span>
                                            <span className="summary-value">{bookingData.date}</span>
                                        </div>
                                    )}
                                    {bookingData.startTime && bookingData.endTime && (
                                        <div className="summary-item">
                                            <span className="summary-label">⏰ 시간</span>
                                            <span className="summary-value">{bookingData.startTime} - {bookingData.endTime}</span>
                                        </div>
                                    )}
                                    {bookingData.selectedCoupon && (
                                        <div className="summary-item">
                                            <span className="summary-label">🎫 쿠폰</span>
                                            <span className="summary-value">{bookingData.selectedCoupon.name} (-{bookingData.couponDiscount?.toLocaleString()}원)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="payment-section">
                            <h3>결제 정보</h3>
                        <div className="toss-form-group">
                            <label className="toss-form-label">결제 금액(원)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                min="100"
                                max="10000000"
                                className="toss-form-input"
                                readOnly // ❌ 하드코딩 방지: DB 값 변경 불가
                            />
                            <div className="toss-input-help">
                                🔒 결제 금액은 예약 시 확정된 금액입니다
                            </div>
                        </div>
                        <div className="toss-form-group">
                            <label className="toss-form-label">상품명</label>
                            <input
                                type="text"
                                value={orderName}
                                onChange={e => setOrderName(e.target.value)}
                                placeholder="상품명을 입력하세요"
                                className="toss-form-input"
                                readOnly // ❌ 하드코딩 방지: DB 값 변경 불가
                            />
                            <div className="toss-input-help">
                                🔒 상품명은 예약 시 확정된 정보입니다
                            </div>
                        </div>
                        </div>

                        <div className="payment-section">
                            <h3>고객 정보</h3>
                            <div className="toss-form-group">
                                <label className="toss-form-label">이메일</label>
                                <input
                                    type="email"
                                    value={customerInfo.email}
                                    onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                                    placeholder="이메일 입력"
                                    className="toss-form-input"
                                />
                            </div>
                            <div className="toss-form-group">
                                <label className="toss-form-label">이름</label>
                                <input
                                    type="text"
                                    value={customerInfo.name}
                                    onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                                    placeholder="이름 입력"
                                    className="toss-form-input"
                                />
                            </div>
                            <div className="toss-form-group">
                                <label className="toss-form-label">전화번호</label>
                                <input
                                    type="tel"
                                    value={customerInfo.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="010-1234-5678"
                                    maxLength="13"
                                    className="toss-form-input"
                                />
                                <div className="toss-input-help">
                                    {customerInfo.phone && !isValidPhone(customerInfo.phone) ?
                                        "❌ 올바른 휴대폰 번호를 입력해주세요" :
                                        "ℹ️ 하이픈은 자동으로 추가됩니다 (숫자만 입력)"
                                    }
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!payment || isLoading}
                            className={`payment-button ${(!payment || isLoading) ? 'processing' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner"></div>
                                    결제 중...
                                </>
                            ) : (
                                "결제하기"
                            )}
                        </button>
                    </form>
                    <div className="toss-test-info">
                        <div>테스트 환경입니다. 실제 결제가 발생하지 않습니다.</div>
                        <div>테스트카드: 4242-4242-4242-4242</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 결제 성공
function TossPaymentSuccess({ paymentData, onHome, onBack }) {
    const [paymentInfo, setPaymentInfo] = useState({
        paymentKey: "",
        orderId: "",
        amount: "",
        reservationId: "",
    });
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmResult, setConfirmResult] = useState(null);
    const [jwtToken, setJwtToken] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentKey = params.get("paymentKey") || "";
        const orderId = params.get("orderId") || "";
        const amount = params.get("amount") || "";

        // sessionStorage에서 결제 데이터 복원
        const savedPaymentData = sessionStorage.getItem('tossPaymentData');
        let reservationId = "";

        if (savedPaymentData) {
            try {
                const parsedData = JSON.parse(savedPaymentData);
                reservationId = parsedData.reservationId || "";

                // URL에서 orderId나 amount가 없으면 저장된 데이터 사용
                if (!orderId && parsedData.orderId) {
                    setPaymentInfo(prev => ({...prev, orderId: parsedData.orderId}));
                }
                if (!amount && parsedData.amount) {
                    setPaymentInfo(prev => ({...prev, amount: parsedData.amount.toString()}));
                }
            } catch (e) {
                console.error('저장된 결제 데이터 파싱 실패:', e);
            }
        }

        const tokenFromStorage = localStorage?.getItem("accessToken") || sessionStorage?.getItem("accessToken");

        setJwtToken(tokenFromStorage || "");
        setPaymentInfo({paymentKey, orderId, amount, reservationId});

        console.log('💳 결제 성공 페이지 데이터:', {paymentKey, orderId, amount, reservationId});
    }, []);

    const handleConfirmPayment = async () => {
        if (!paymentInfo.paymentKey || !paymentInfo.orderId || !paymentInfo.amount) {
            return alert("결제 정보가 없습니다.");
        }
        if (!jwtToken) {
            return alert("로그인이 필요합니다.");
        }

        setIsConfirming(true);
        setConfirmResult(null);

        console.log('🔄 결제 승인 요청 시작');
        console.log('📋 승인 요청 데이터:', {
            paymentKey: paymentInfo.paymentKey,
            orderId: paymentInfo.orderId,
            amount: paymentInfo.amount,
            reservationId: paymentInfo.reservationId
        });

        try {
            const response = await fetch(`${BASE_URL}/api/v1/payments/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({
                    paymentKey: paymentInfo.paymentKey,
                    orderId: paymentInfo.orderId,
                    amount: Number(paymentInfo.amount),
                    reservationId: Number(paymentInfo.reservationId),
                }),
            });

            console.log('📊 응답 상태:', response.status);

            const data = await response.json();
            console.log('📋 응답 데이터:', data);

            if (response.ok) {
                setConfirmResult({success: true, data});
                console.log('✅ 결제 승인 성공');

                // 결제 승인 성공 시 임시 데이터 정리
                sessionStorage.removeItem('tossPaymentData');
            } else {
                throw new Error(data.message || "결제 승인 실패");
            }
        } catch (error) {
            console.error('❌ 결제 승인 실패:', error);
            setConfirmResult({success: false, error: error.message});
            if (error.message.includes("인증")) {
                localStorage?.removeItem("accessToken");
                sessionStorage?.removeItem("accessToken");
                setJwtToken("");
            }
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="payment-container">
            <div className="payment-header">
                <button className="back-button" onClick={onBack}>
                    ← 뒤로가기
                </button>
                <h1>결제 성공</h1>
            </div>

            <div className="payment-content">
                <div className="payment-section">
                    <div className="toss-success-content">
                        <div className="payment-status-icon payment-status-success">
                            <svg
                                width={34}
                                height={34}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#38d39f"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 10 18 4 12"/>
                            </svg>
                        </div>
                        <h2 className="toss-success-title">
                            결제 성공
                        </h2>
                        <div className="toss-success-desc">
                            결제가 정상적으로 완료되었습니다.
                        </div>
                    </div>
                    <div className="price-breakdown">
                        <div className="price-item">
                            <span>금액</span>
                            <span className="price-value">{Number(paymentInfo.amount).toLocaleString()}원</span>
                        </div>
                    </div>
                    <button
                        onClick={handleConfirmPayment}
                        disabled={isConfirming || !jwtToken}
                        className={`payment-button ${(isConfirming || !jwtToken) ? 'processing' : ''}`}
                    >
                        {isConfirming ? (
                            <>
                                <div className="spinner"></div>
                                승인 처리 중...
                            </>
                        ) : (
                            "결제 승인 처리"
                        )}
                    </button>
                    {confirmResult && (
                        <div className="toss-confirm-result">
                            {confirmResult.success ? "승인이 완료 되었습니다." : "승인이 실패하였습니다."}
                        </div>
                    )}
                    <div className="toss-action-buttons">
                        <button
                            onClick={onHome}
                            className="toss-action-button"
                        >
                            홈으로
                        </button>
                        <span className="toss-action-divider">|</span>
                        <button
                            onClick={onBack}
                            className="toss-action-button"
                        >
                            이전
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 결제 실패
function TossPaymentFail({ onBack, onHome }) {
    const [errorInfo, setErrorInfo] = useState({
        code: "",
        message: "",
        orderId: "",
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setErrorInfo({
            code: params.get("code") || "",
            message: params.get("message") || "결제 처리 중 문제가 발생했습니다.", // ❌ 하드코딩 제거
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

            <div style={{background: "linear-gradient(90deg, #e4efe5 50%, #e1efe1 100%)", minHeight: "100vh", paddingTop: 40}}>
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

// SPA 라우터 없이 동작 (현재 프로젝트 구조에 맞게)
const TossPaymentApp = ({ 
    currentTossPage, 
    bookingData, 
    paymentData,
    onBack, 
    onHome,
    onTossSuccess,
    onTossFail
}) => {
    // 개발 환경에서 디버깅 정보 출력
    useEffect(() => {
        if (import.meta.env.DEV) {
            console.group('🔍 TossPaymentApp 디버깅 정보');
            console.log('📄 currentTossPage:', currentTossPage);
            console.log('📦 bookingData:', bookingData);
            console.log('💳 paymentData:', paymentData);
            console.log('🌐 현재 URL:', window.location.href);
            console.log('📋 URL 파라미터:', Object.fromEntries(new URLSearchParams(window.location.search)));
            console.groupEnd();
        }
    }, [currentTossPage, bookingData, paymentData]);

    if (currentTossPage === "toss-success") return (
        <TossPaymentSuccess 
            paymentData={paymentData} 
            onHome={onHome} 
            onBack={onBack}
        />
    );
    
    if (currentTossPage === "toss-fail") return (
        <TossPaymentFail 
            onBack={onBack} 
            onHome={onHome}
        />
    );
    
    return (
        <TossPaymentComponent
            bookingData={bookingData}
            onBack={onBack}
            onTossSuccess={onTossSuccess}
            onTossFail={onTossFail}
            onHome={onHome}
        />
    );
};

export default TossPaymentApp;

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