/*
 * 🔥 실제 운영용 handleBooking 함수 (임시 코드 제거된 버전)
 *
 * const handleBooking = async () => {
 *   if (selectedDate && selectedStartTime && selectedEndTime && selectedService) {
 *     try {
 *       const selectedTicket = serviceOptions.find(option => option.id === selectedService);
 *
 *       if (!selectedTicket) {
 *         alert('선택된 서비스 정보를 찾을 수 없습니다.');
 *         return;
 *       }
 *
 *       const startDateTime = `${selectedDate} ${selectedStartTime}:00`;
 *       const endDateTime = `${selectedDate} ${selectedEndTime}:00`;
 *
 *       const reservationData = {
 *         mentor: mentor?.userId || mentor?.id,
 *         ticket: selectedService,
 *         reservationStatus: "REQUESTED",
 *         reservationStartAt: startDateTime,
 *         reservationEndAt: endDateTime
 *       };
 *
 *       const reservationResponse = await reservationAPI.createReservation(reservationData);
 *       const createdReservationId = reservationResponse.data.data.id || reservationResponse.data.id;
 *
 *       const bookingData = {
 *         mentor: mentor,
 *         date: selectedDate,
 *         startTime: selectedStartTime,
 *         endTime: selectedEndTime,
 *         ticketId: selectedService,
 *         reservationId: createdReservationId,
 *         ticket: { id: selectedTicket.id, name: selectedTicket.name, duration: selectedTicket.duration, price: selectedTicket.price },
 *         serviceName: selectedTicket.duration || selectedTicket.name?.replace(" 이용권", "") || "선택된 서비스",
 *         servicePrice: selectedTicket.price || 0
 *       };
 *
 *       if (onBooking) onBooking(bookingData);
 *
 *     } catch (error) {
 *       console.error('❌ 예약 생성 중 오류:', error);
 *       alert('예약 생성에 실패했습니다. 다시 시도해주세요.');
 *     }
 *   } else {
 *     alert('모든 항목을 선택해주세요.');
 *   }
 * };
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import './Booking.css';
import { reservationAPI, consultationAPI, ticketAPI } from "../services/api";

const Booking = ({ mentor, onBack, onBooking }) => {
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [consultationStartAt, setConsultationStartAt] = useState(null);
  const [consultationEndAt, setConsultationEndAt] = useState(null);
  const [consultationSlots, setConsultationSlots] = useState([]);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 5));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. 티켓(이용권) 목록 불러오기
  useEffect(() => {
    setLoading(true);
    ticketAPI.getTickets() // ticketAPI에서 id 파라미터 없이 전체 목록 조회
    .then(res => {
      setServiceOptions(res.data.data);
      setLoading(false);
    })
    .catch(err => {
      setError('이용권 정보를 불러오는 데 실패했습니다.');
      setLoading(false);
    });
  }, []);

  function getDayOfWeek(dateString) {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    // dateString expected in 'YYYY-MM-DD' format
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return days[date.getDay()];
  }

  useEffect(() => {
    console.log("Booking mentor prop:", mentor); // <- id/userId가 실제로 찍히는지 확인
    // ...
  }, [mentor]);

  // 2. 날짜 선택 시 해당 날짜의 예약 가능 시간 계산 (예약 현황 고려)
  useEffect(() => {
    if (!selectedDate || !mentor?.userId) return;

    console.log(`🔍 날짜 선택됨 - 멘토ID: ${mentor.userId}, 날짜: ${selectedDate}`);

    const dayOfWeek = getDayOfWeek(selectedDate);
    console.log(`🔍 변환된 요일: ${dayOfWeek}`);

    // 기존 예약 목록 API를 사용해서 해당 날짜의 예약 현황 파악
    console.log(`🔍 예약 목록 API 호출로 날짜별 예약 현황 확인`);
    
    Promise.all([
      consultationAPI.getAvailableConsultationSlots(mentor.userId, dayOfWeek),
      reservationAPI.getReservations()
    ])
    .then(([consultationRes, reservationsRes]) => {
      console.log("🔍 상담 시간 API 응답:", consultationRes);
      console.log("🔍 전체 예약 목록 API 응답:", reservationsRes);
      
      // 1. 멘토의 기본 상담 시간 추출
      const consultationSlots = consultationRes.data?.data || consultationRes.data || [];
      console.log("🧪 멘토 기본 상담 시간:", consultationSlots);
      
      // 2. 전체 예약 목록에서 해당 멘토, 해당 날짜의 예약만 필터링
      const allReservations = reservationsRes.data?.data || reservationsRes.data || [];
      console.log("🧪 전체 예약 목록:", allReservations);
      
      // 해당 멘토의 해당 날짜 예약만 필터링
      const todayReservations = allReservations.filter(reservation => {
        // 멘토 ID 매칭
        const mentorMatches = reservation.mentor === mentor.userId || 
                             reservation.mentorId === mentor.userId ||
                             reservation.mentor?.id === mentor.userId;
        
        // 날짜 매칭 (예약 시작 시간에서 날짜 부분 추출)
        let reservationDate = null;
        if (reservation.reservationStartAt) {
          if (reservation.reservationStartAt.includes('T')) {
            reservationDate = reservation.reservationStartAt.split('T')[0];
          } else if (reservation.reservationStartAt.includes(' ')) {
            reservationDate = reservation.reservationStartAt.split(' ')[0];
          }
        }
        
        const dateMatches = reservationDate === selectedDate;
        
        console.log(`예약 확인: 멘토매칭=${mentorMatches}, 날짜매칭=${dateMatches}, 예약=${reservation.reservationStartAt}`);
        
        return mentorMatches && dateMatches;
      });
      
      console.log(`📅 ${selectedDate}에 해당 멘토의 예약:`, todayReservations);

      // 예약 API 응답 처리
      if (Array.isArray(availableSlots) && availableSlots.length > 0) {
        console.log("📋 예약 가능한 시간 슬롯이 있음");
        
        // 예약 가능한 시간 슬롯들에서 시간 추출
        const processedSlots = availableSlots
          .filter(slot => slot.startTime && slot.endTime)
          .map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            original: slot
          }))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        console.log("🔍 처리된 예약 가능 시간들:", processedSlots);

        if (processedSlots.length > 0) {
          const startTimes = processedSlots.map(slot => slot.startTime);
          const endTimes = processedSlots.map(slot => slot.endTime);
          
          const earliestStart = startTimes.reduce((a, b) => a < b ? a : b);
          const latestEnd = endTimes.reduce((a, b) => a > b ? a : b);
          
          console.log(`🕒 예약 가능 시간 범위: ${earliestStart} ~ ${latestEnd}`);
          
          setConsultationStartAt(`${selectedDate}T${earliestStart}:00`);
          setConsultationEndAt(`${selectedDate}T${latestEnd}:00`);
          
          console.log(`✅ 예약 API 기반 시간 설정: ${earliestStart} ~ ${latestEnd}`);
        } else {
          console.log("❌ 처리 가능한 예약 슬롯 없음 - 기본 시간 사용");
          setConsultationStartAt(`${selectedDate}T09:00:00`);
          setConsultationEndAt(`${selectedDate}T18:00:00`);
        }
      } else {
        console.log("📅 예약 가능한 시간 슬롯이 없음 - 전체 시간 사용 가능");
        
        // 예약 가능한 시간이 없다는 것은 전체 시간이 사용 가능하다는 의미일 수 있음
        setConsultationStartAt(`${selectedDate}T09:00:00`);
        setConsultationEndAt(`${selectedDate}T18:00:00`);
        
        console.log(`✅ 전체 시간 사용 가능: 09:00 ~ 18:00`);
      }
    })
    .catch(err => {
      console.error('❌ 시간 조회 실패:', err);
      
      // 에러 발생 시 기본 시간 사용
      console.log("⚠️ 에러 발생 - 기본 시간 사용 (09:00-18:00)");
      setConsultationStartAt(`${selectedDate}T09:00:00`);
      setConsultationEndAt(`${selectedDate}T18:00:00`);
    });
  }, [mentor?.userId, selectedDate]);

  /* useEffect(() => {
     if (!selectedDate || !mentor?.userId) return;

     const dayOfWeek = getDayOfWeek(selectedDate);

     consultationAPI.getAvailableConsultationSlots(mentor.userId, dayOfWeek)
     .then(res => {
       const slots = res.data.data;
       const selectedSlots = slots.filter(slot => {
         if (!slot.availableStartAt) return false;
         const slotDate = slot.availableStartAt.split(' ')[0].split('T')[0];
         return slotDate === selectedDate;
       });
       if (selectedSlots.length > 0) {
         const startTimes = selectedSlots.map(slot => slot.availableStartAt);
         const endTimes = selectedSlots.map(slot => slot.availableEndAt);
         const minStart = startTimes.reduce((a, b) => (a < b ? a : b));
         const maxEnd = endTimes.reduce((a, b) => (a > b ? a : b));
         setConsultationStartAt(minStart);
         setConsultationEndAt(maxEnd);
       } else {
         setConsultationStartAt(null);
         setConsultationEndAt(null);
       }
     });
   }, [mentor?.userId, selectedDate]);*/



  // 3. 10분 단위 구간으로 분할
  useEffect(() => {
    if (!consultationStartAt || !consultationEndAt) {
      setConsultationSlots([]);
      return;
    }
    setConsultationSlots(generateConsultationSlots(consultationStartAt, consultationEndAt));
  }, [consultationStartAt, consultationEndAt]);

  function generateConsultationSlots(startAt, endAt) {
    if (!startAt || !endAt) return [];
    const result = [];
    let start = new Date(startAt);
    const end = new Date(endAt);

    // Reset seconds and milliseconds for precise comparison
    start.setSeconds(0, 0);
    end.setSeconds(0, 0);

    // 종료 시간까지 포함하도록 수정 (<=를 사용하여 16:00까지 포함)
    while (start <= end) {
      const minutes = start.getMinutes();
      if (minutes % 10 === 0) {
        const hours = start.getHours().toString().padStart(2, '0');
        const mins = minutes.toString().padStart(2, '0');
        result.push(`${hours}:${mins}`);
      }
      start.setMinutes(start.getMinutes() + 10); // 10분 단위로 증가하도록 수정
    }

    return result;
  }

  // 달력 함수들
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDate = (year, month, day) => `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const isToday = (year, month, day) => {
    const today = new Date();
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };
  const isSelected = (year, month, day) => {
    if (!selectedDate) return false;
    return selectedDate === formatDate(year, month, day);
  };

  // 달력 렌더링 함수
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayHeaders = dayNames.map(day => (
        <div key={day} className="calendar-day-header">{day}</div>
    ));

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(year, month, day);
      const isSelectedDay = isSelected(year, month, day);

      // 선택된 날짜가 있으면 오늘 표시를 하지 않음 (어떤 날짜든 선택되면 today 스타일 제거)
      const shouldShowToday = isCurrentDay && !selectedDate;

      days.push(
          <div
              key={day}
              className={`calendar-day ${shouldShowToday ? 'today' : ''} ${isSelectedDay ? 'selected' : ''}`}
              onClick={() => setSelectedDate(formatDate(year, month, day))}
          >
            {day}
          </div>
      );
    }

    return (
        <div className="calendar">
          <div className="calendar-header">
            <button className="calendar-nav" onClick={() => setCurrentMonth(new Date(year, month - 1))}>
              <ChevronLeft size={20} />
            </button>
            <h3>{month + 1}월 {year}</h3>
            <button className="calendar-nav" onClick={() => setCurrentMonth(new Date(year, month + 1))}>
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="calendar-grid">
            {dayHeaders}
            {days}
          </div>
        </div>
    );
  };

  // 예약 버튼 클릭 시 실행
  const handleBooking = async () => {
    // 1. 필수 입력값 검증
    if (!selectedDate || !selectedStartTime || !selectedEndTime || !selectedService) {
      alert('모든 항목을 선택해주세요.');
      return;
    }

    // 2. 멘토 정보 검증
    if (!mentor?.userId && !mentor?.id) {
      alert('멘토 정보가 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    // 3. 시간 유효성 검증
    if (selectedStartTime >= selectedEndTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    // 4. 로그인 상태 확인
    const token = localStorage?.getItem("accessToken") || sessionStorage?.getItem("accessToken");
    if (!token) {
      alert('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
      return;
    }

    try {
      // 선택한 ticketId로 티켓 상세 정보 찾기
      const selectedTicket = serviceOptions.find(option => option.id === selectedService);

      if (!selectedTicket) {
        alert('선택된 서비스 정보를 찾을 수 없습니다.');
        return;
      }

      console.log('🎯 예약 시작 - 선택된 정보:', {
        멘토: mentor?.name || mentor?.userId,
        날짜: selectedDate,
        시간: `${selectedStartTime} ~ ${selectedEndTime}`,
        서비스: selectedTicket.name,
        가격: selectedTicket.price
      });

      // 1. 먼저 예약을 생성
      // 날짜와 시간을 LocalDateTime 형식으로 변환 (초 단위까지 명시)
      const startDateTime = `${selectedDate}T${selectedStartTime}:00.000`;
      const endDateTime = `${selectedDate}T${selectedEndTime}:00.000`;

      const reservationData = {
        mentor: mentor?.userId || mentor?.id,
        ticket: selectedService,
        reservationStatus: "REQUESTED", // 예약 요청 상태
        reservationStartAt: startDateTime,
        reservationEndAt: endDateTime
      };

      console.log('🔄 예약 생성 중...', reservationData);

      let createdReservationId;

      // 실제 예약 API 호출
      try {
        const reservationResponse = await reservationAPI.createReservation(reservationData);

        // 응답 구조 확인 및 ID 추출
        console.log('📋 예약 생성 응답:', reservationResponse);

        if (reservationResponse.data) {
          // 일반적인 응답 구조: { success: true, data: { id: 1, ... } }
          createdReservationId = reservationResponse.data.data?.id || reservationResponse.data.id;
        } else {
          // 직접 응답 구조: { id: 1, ... }
          createdReservationId = reservationResponse.id;
        }

        if (!createdReservationId) {
          throw new Error('예약 ID를 찾을 수 없습니다. 응답 구조를 확인해주세요.');
        }

        console.log('✅ 예약 생성 완료. 예약 ID:', createdReservationId);

      } catch (error) {
        console.error('❌ 예약 생성 실패:', error);

        // 구체적인 오류 메시지 표시
        let errorMessage = '예약 생성에 실패했습니다.';

        if (error.response?.data?.message) {
          errorMessage += ` (${error.response.data.message})`;
        } else if (error.message) {
          errorMessage += ` (${error.message})`;
        }

        // 인증 오류인 경우
        if (error.response?.status === 401) {
          errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
        }
        // 중복 예약인 경우
        else if (error.response?.status === 409 || error.message.includes('중복')) {
          errorMessage = '이미 예약된 시간입니다. 다른 시간을 선택해주세요.';
        }
        // 권한 오류인 경우
        else if (error.response?.status === 403) {
          errorMessage = '예약 권한이 없습니다.';
        }

        alert(errorMessage);
        return; // 예약 생성 실패 시 함수 종료
      }

      // 2. 예약 완료 후 결제 데이터 구성
      const bookingData = {
        mentor: mentor,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        ticketId: selectedService,
        reservationId: createdReservationId, // 🎯 실제 생성된 예약 ID 사용
        ticket: {
          id: selectedTicket.id,
          name: selectedTicket.name,
          duration: selectedTicket.duration,
          price: selectedTicket.price
        },
        serviceName: selectedTicket.duration || selectedTicket.name?.replace(" 이용권", "") || "선택된 서비스",
        servicePrice: selectedTicket.price || 0,
        // 예약 생성 시간 추가 (디버깅용)
        createdAt: new Date().toISOString(),
        // 예약 시간 정보 추가
        reservationStartAt: `${selectedDate}T${selectedStartTime}:00`,
        reservationEndAt: `${selectedDate}T${selectedEndTime}:00`
      };

      console.log('📦 최종 예약 데이터:', bookingData);
      console.log('🎉 예약 성공! 결제 페이지로 이동합니다.');

      if (onBooking) onBooking(bookingData);

    } catch (error) {
      console.error('❌ 예약 처리 중 오류:', error);
      alert('예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };


  return (
      <div className="booking-container">
        <div className="booking-header">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft className="icon" />
          </button>
          <h1>예약하기</h1>
        </div>

        <div className="booking-content">
          {/* 서비스(이용권) 선택 */}
          <div className="booking-section">
            <h3><Clock className="icon" /> 서비스 시간 선택</h3>
            {loading ? (
                <div>이용권 정보를 불러오는 중...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : (
                <div className="service-options">
                  {serviceOptions.length === 0 && <div>이용 가능한 서비스가 없습니다.</div>}
                  {serviceOptions.map(option => (
                      <label key={option.id} className="service-option">
                        <input
                            type="radio"
                            name="service"
                            value={option.id}
                            checked={selectedService === option.id}
                            onChange={() => setSelectedService(option.id)}
                            style={{ display: 'none' }}
                        />
                        <span>
                    {option.duration
                        ? option.duration
                        : option.name
                            ? option.name.replace(" 이용권", "")
                            : ""}
                  </span>
                        <span className="price">
                    {option.price ? option.price.toLocaleString() + '원' : ''}
                  </span>
                      </label>
                  ))}
                </div>
            )}
          </div>

          {/* 날짜(캘린더) 선택 */}
          <div className="booking-section">
            <h3><Calendar className="icon" /> 가능한 일자를 선택해주세요.</h3>
            {renderCalendar()}
            {selectedDate && (
                <div className="selected-date-info">
                  * 해당 일자의 가능한 시간대
                  <div className="available-time">
                    {consultationSlots.length > 0
                        ? `${consultationSlots[0]} ~ ${consultationSlots[consultationSlots.length-1]}`
                        : "상담 가능 시간이 없습니다."}
                  </div>
                </div>
            )}
          </div>

          {/* 시간 구간 선택 */}
          <div className="booking-section">
            <h3>가능한 시간 범위(최소 20분)를 선택해주세요.</h3>
            <div className="time-selector">
              <div className="time-dropdown">
                <select
                    value={selectedStartTime}
                    onChange={e => setSelectedStartTime(e.target.value)}
                    className="time-select"
                    disabled={consultationSlots.length === 0}
                >
                  <option value="">시작 시간</option>
                  {consultationSlots.map((slot, idx) => (
                      <option key={idx} value={slot}>{slot}</option>
                  ))}
                </select>
                <ChevronDown className="dropdown-icon" />
              </div>
              <span className="time-separator">~</span>
              <div className="time-dropdown">
                <select
                    value={selectedEndTime}
                    onChange={e => setSelectedEndTime(e.target.value)}
                    className="time-select"
                    disabled={consultationSlots.length === 0}
                >
                  <option value="">종료 시간</option>
                  {consultationSlots.map((slot, idx) => (
                      <option key={idx} value={slot}>{slot}</option>
                  ))}
                </select>
                <ChevronDown className="dropdown-icon" />
              </div>
            </div>
          </div>

          <button className="booking-button" onClick={handleBooking}>
            예약하기
          </button>
        </div>
      </div>
  );
};

export default Booking;
