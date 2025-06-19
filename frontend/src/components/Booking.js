import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import './Booking.css';

const Booking = ({ mentor, onBack }) => {
  const [selectedDate, setSelectedDate] = useState('2025-06-26');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');

  const serviceOptions = [
    { id: 1, duration: '20분', price: '14,900원' },
    { id: 2, duration: '30분', price: '18,900원' },
    { id: 3, duration: '40분', price: '22,900원' }
  ];

  const timeSlots = [
    '21:30', '21:40', '21:50',
    '22:00', '22:10', '22:20', '22:30', '22:40', '22:50',
    '23:00'
  ];

  const handleBooking = () => {
    if (selectedTime && selectedService) {
      alert(`예약이 완료되었습니다!\n날짜: ${selectedDate}\n시간: ${selectedTime}\n서비스: ${selectedService}`);
    } else {
      alert('시간과 서비스를 선택해주세요.');
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
          <h3><Calendar className="icon" /> 날짜 선택</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>

        <div className="booking-section">
          <h3>시간 선택</h3>
          <p className="time-range">21:30 - 23:00</p>
          <div className="time-slots">
            {timeSlots.map(time => (
              <button
                key={time}
                className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
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
