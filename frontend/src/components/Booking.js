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
    ticketAPI.getTickets()
    .then(res => {
      // res.data.data 구조 확인 필수 (콘솔로도 한 번 찍어보세요)
      setServiceOptions(res.data.data);
      setLoading(false);
    })
    .catch(err => {
      setError('이용권 정보를 불러오는 데 실패했습니다.');
      setLoading(false);
    });
  }, []);

  // 2. 날짜 선택 시 해당 날짜의 상담 가능 시간 조회
  useEffect(() => {
    if (!selectedDate || !mentor?.id) return;
    // 예시: userId=멘토id, date=yyyy-MM-dd
    consultationAPI.getConsultations({ userId: mentor.id, date: selectedDate })
    .then(res => {
      const consultation = res.data.data && res.data.data.length > 0 ? res.data.data[0] : null;
      setConsultationStartAt(consultation?.start_at || null);
      setConsultationEndAt(consultation?.end_at || null);
    })
    .catch(() => {
      setConsultationStartAt(null);
      setConsultationEndAt(null);
    });
  }, [mentor?.id, selectedDate]);

  // 3. 10분 단위 구간으로 분할
  useEffect(() => {
    if (!consultationStartAt || !consultationEndAt) {
      setConsultationSlots([]);
      return;
    }
    setConsultationSlots(generateConsultationSlots(consultationStartAt, consultationEndAt));
  }, [consultationStartAt, consultationEndAt]);

  // 4. 10분 단위 구간 생성 함수
  function generateConsultationSlots(startAt, endAt) {
    if (!startAt || !endAt) return [];
    const result = [];
    let start = new Date(startAt);
    let end = new Date(endAt);
    while (start < end) {
      let slotEnd = new Date(start.getTime() + 10 * 60000);
      if (slotEnd > end) slotEnd = end;
      // '09:00', '09:10' ... 스타일
      const format = date => date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
      result.push(format(start));
      start = slotEnd;
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
      days.push(
          <div
              key={day}
              className={`calendar-day ${isCurrentDay ? 'today' : ''} ${isSelectedDay ? 'selected' : ''}`}
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
  const handleBooking = () => {
    if (selectedDate && selectedStartTime && selectedEndTime && selectedService) {
      const bookingData = {
        mentor: mentor,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        ticketId: selectedService
      };
      if (onBooking) onBooking(bookingData);
    } else {
      alert('모든 항목을 선택해주세요.');
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
            <h3>가능한 시간 범위(최소 10분)를 선택해주세요.</h3>
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