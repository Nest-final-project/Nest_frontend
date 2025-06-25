import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, FileText } from 'lucide-react';
import { reservationAPI, userAPI, ticketAPI } from '../../services/api';
import './BookingHistory.css';

const BookingHistory = ({ userInfo }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!dataLoaded) {
      fetchReservations();
    }
  }, [dataLoaded]);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await reservationAPI.getReservations();
      const rawReservations = response.data.data.content;

      // 1. 필요한 모든 멘토, 멘티, 티켓 ID를 수집
      const uniqueMentorIds = new Set();
      const uniqueMenteeIds = new Set();
      const uniqueTicketIds = new Set();

      rawReservations.forEach(reservation => {
        uniqueMentorIds.add(reservation.mentor);
        uniqueMenteeIds.add(reservation.mentee);
        uniqueTicketIds.add(reservation.ticket);
      });

      // 2. 각 고유 ID에 대해 한 번씩만 API 호출 (Promise.all 사용)
      const mentorPromises = Array.from(uniqueMentorIds).map(
        id => userAPI.getUserById(id)
      );
      const menteePromises = Array.from(uniqueMenteeIds).map(
        id => userAPI.getUserById(id)
      );
      const ticketPromises = Array.from(uniqueTicketIds).map(
        id => ticketAPI.getTicket(id)
      );

      const [mentorResponses, menteeResponses, ticketResponses] = await Promise.all([
        Promise.all(mentorPromises),
        Promise.all(menteePromises),
        Promise.all(ticketPromises)
      ]);

      // 3. ID를 키로 하는 Map을 생성하여 빠른 조회를 가능하게 함
      const mentorMap = new Map(
        mentorResponses.map(res => [res.data.data.id, res.data.data.name])
      );
      const menteeMap = new Map(
        menteeResponses.map(res => [res.data.data.id, res.data.data.name])
      );
      const ticketMap = new Map(
        ticketResponses.map(res => [
          res.data.data.id,
          {
            name: res.data.data.name,
            price: res.data.data.price,
            time: res.data.data.ticketTime
          }
        ])
      );

      // 4. 원본 예약 데이터와 조회된 정보들을 조합
      const fetchedReservations = rawReservations.map(reservation => {
        const mentorName = mentorMap.get(reservation.mentor) || '알 수 없음';
        const menteeName = menteeMap.get(reservation.mentee) || '알 수 없음';
        const ticketInfo = ticketMap.get(reservation.ticket);

        return {
          id: reservation.id,
          mentor: mentorName,
          mentee: menteeName,
          ticketName: ticketInfo ? ticketInfo.name : '알 수 없음',
          ticketPrice: ticketInfo ? ticketInfo.price : 0,
          ticketTime: ticketInfo ? ticketInfo.time : 0,
          status: reservation.reservationStatus,
          startTime: reservation.reservationStartAt,
          endTime: reservation.reservationEndAt
        };
      });

      setReservations(fetchedReservations);
      setDataLoaded(true);
    } catch (err) {
      console.error("예약 내역을 불러오는 데 실패했습니다:", err);
      setError("예약 내역을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const formatTicketTime = (time) => {
    if (typeof time === 'string' && time.startsWith('MINUTES_')) {
      return time.replace('MINUTES_', '');
    }
    return time;
  };

  const handleRetry = () => {
    setDataLoaded(false);
    setError(null);
    fetchReservations();
  };

  if (loading) {
    return (
      <div className="bookings-tab">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>예약 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-tab">
        <div className="error-state">
          <BookOpen className="error-icon" />
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
    <div className="bookings-tab">
      <div className="section-header">
        <h3>{userInfo.userRole === 'MENTOR' ? '예정된 예약' : '예약 내역'}</h3>
        <p>
          {userInfo.userRole === 'MENTOR'
            ? '예정된 멘토링 세션을 확인하고 관리하세요'
            : '멘토링 예약 및 이용 내역을 확인하세요'}
        </p>
      </div>

      {reservations.length > 0 ? (
        <div className="reservations-scroll-container">
          <div className="reservations-container">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-header">
                  <div className="reservation-title">
                    <h4>{reservation.ticketName}</h4>
                    <span
                      className={`status-badge ${reservation.status.toLowerCase()}`}
                    >
                      {reservation.status === 'CONFIRMED' ? '확정' :
                       reservation.status === 'PENDING' ? '대기중' :
                       reservation.status === 'COMPLETED' ? '완료' :
                       reservation.status === 'CANCELLED' ? '취소됨' :
                       reservation.status}
                    </span>
                  </div>
                  <div className="reservation-price">
                    ₩{reservation.ticketPrice.toLocaleString()}
                  </div>
                </div>

                <div className="reservation-body">
                  <div className="reservation-info">
                    <div className="info-row">
                      <span className="info-label">
                        {userInfo.userRole === 'MENTOR' ? '멘티' : '멘토'}
                      </span>
                      <span className="info-value">
                        {userInfo.userRole === 'MENTOR' 
                          ? reservation.mentee 
                          : reservation.mentor}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">이용 시간</span>
                      <span className="info-value">{formatTicketTime(reservation.ticketTime)}분</span>
                    </div>
                  </div>

                  <div className="reservation-schedule">
                    <div className="schedule-item">
                      <Clock className="schedule-icon" />
                      <div className="schedule-details">
                        <div className="schedule-date">
                          {new Date(reservation.startTime).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </div>
                        <div className="schedule-time">
                          {new Date(reservation.startTime).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} ~ {new Date(reservation.endTime).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="reservation-actions">
                  {reservation.status === 'CONFIRMED' && (
                    <button className="action-btn primary">
                      <BookOpen size={16} />
                      상담 시작
                    </button>
                  )}
                  {reservation.status === 'COMPLETED' && (
                    <button className="action-btn secondary">
                      <FileText size={16} />
                      리뷰 작성
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 스크롤 가이드 */}
          <div className="scroll-guide">
            <span>더 많은 예약 내역을 보려면 스크롤하세요</span>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <BookOpen className="empty-icon" />
          <h4>
            {userInfo.userRole === 'MENTOR'
              ? '아직 예정된 예약이 없습니다'
              : '아직 예약 내역이 없습니다'}
          </h4>
          <p>
            {userInfo.userRole === 'MENTOR'
              ? '멘티들이 예약을 하면 여기에서 확인할 수 있어요!'
              : '멘토링을 예약하고 성장해보세요!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
