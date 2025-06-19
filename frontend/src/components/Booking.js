import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import './Booking.css';

const Booking = ({ mentor, onBack, onBooking }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 5)); // 6월 2025

  const serviceOptions = [
    { id: 1, duration: '20분', price: '14,900원' },
    { id: 2, duration: '30분', price: '18,900원' },
    { id: 3, duration: '40분', price: '22,900원' }
  ];

  // 10분 단위 시간 슬롯 생성
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 21; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        if (hour === 23 && minute > 0) break; // 23:00까지만
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // 달력 관련 함수들
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const isToday = (year, month, day) => {
    const today = new Date();
    return year === today.getFullYear() && 
           month === today.getMonth() && 
           day === today.getDate();
  };

  const isSelected = (year, month, day) => {
    if (!selectedDate) return false;
    const dateStr = formatDate(year, month, day);
    return selectedDate === dateStr;
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    
    const days = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 요일 헤더
    const dayHeaders = dayNames.map(day => (
      <div key={day} className="calendar-day-header">{day}</div>
    ));

    // 빈 셀들 (이전 달)
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // 현재 달의 날짜들
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
          <button 
            className="calendar-nav"
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
          >
            <ChevronLeft size={20} />
          </button>
          <h3>{month + 1}월 {year}</h3>
          <button 
            className="calendar-nav"
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
          >
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

  const handleBooking = () => {
    if (selectedDate && selectedStartTime && selectedEndTime && selectedService) {
      // 결제 페이지로 전달할 데이터
      const bookingData = {
        mentor: mentor,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        service: selectedService
      };
      
      // onBooking 콜백으로 예약 데이터 전달
      if (onBooking) {
        onBooking(bookingData);
      }
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
        <div className="booking-section">
          <h3><Clock className="icon" /> 서비스 시간 선택</h3>
          <div className="service-options">
            {serviceOptions.map(option => (
              <label key={option.id} className="service-option">
                <input
                  type="radio"
                  name="service"
                  value={option.duration}
                  onChange={(e) => setSelectedService(e.target.value)}
                />
                <span>{option.duration}</span>
                <span className="price">{option.price}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="booking-section">
          <h3><Calendar className="icon" /> 가능한 일자를 선택해주세요.</h3>
          {renderCalendar()}
          {selectedDate && (
            <div className="selected-date-info">
              * 해당 일자의 가능한 시간대
              <div className="available-time">21:30 - 23:00</div>
            </div>
          )}
        </div>

        <div className="booking-section">
          <h3>가능한 시간 범위(최소 40분)를 선택해주세요.</h3>
          <div className="time-selector">
            <div className="time-dropdown">
              <select 
                value={selectedStartTime} 
                onChange={(e) => setSelectedStartTime(e.target.value)}
                className="time-select"
              >
                <option value="">시작 시간</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <ChevronDown className="dropdown-icon" />
            </div>
            
            <span className="time-separator">~</span>
            
            <div className="time-dropdown">
              <select 
                value={selectedEndTime} 
                onChange={(e) => setSelectedEndTime(e.target.value)}
                className="time-select"
              >
                <option value="">종료 시간</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
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
