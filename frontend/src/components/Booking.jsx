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

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  });
  const [consultationStartAt, setConsultationStartAt] = useState(null);
  const [consultationEndAt, setConsultationEndAt] = useState(null);
  const [consultationTimesByDate, setConsultationTimesByDate] = useState({});
  const [consultationSlots, setConsultationSlots] = useState([]);
  const [availableEndTimes, setAvailableEndTimes] = useState([]);
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
    if (!selectedDate || !mentor?.userId) {
      // 날짜나 멘토가 없으면 상태 초기화
      setConsultationSlots([]);
      setSelectedStartTime('');
      setSelectedEndTime('');
      return;
    }

    console.log(`🔍 날짜 선택됨 - 멘토ID: ${mentor.userId}, 날짜: ${selectedDate}`);

    const dayOfWeek = getDayOfWeek(selectedDate);
    console.log(`🔍 변환된 요일: ${dayOfWeek}`);

    // 기존 선택된 시간 초기화
    setSelectedStartTime('');
    setSelectedEndTime('');

    // 상담 시간 설정 API와 예약 목록 API를 호출하여 상담 시간 정보를 조합
    // 1) 상담 시간 설정 API (getAvailableConsultationSlots) - 멘토가 설정한 요일별 상담 가능 시간
    // 2) 예약 목록 API (getReservations) - 전체 예약 목록 (클라이언트에서 예약된 시간 제외 처리)
    console.log(`🔍 상담 관련 API 호출: 멘토ID=${mentor.userId}, 요일=${dayOfWeek}, 날짜=${selectedDate}`);

    Promise.all([
      consultationAPI.getAvailableConsultationSlots(mentor.userId, dayOfWeek),
      reservationAPI.getReservations()
    ])
    .then(([consultationSlotsRes, reservationsRes]) => {
      console.log("🔍 멘토 상담 시간 설정 API 응답:", consultationSlotsRes);
      console.log("🔍 전체 예약 목록 API 응답:", reservationsRes);
      
      console.log("🔍 상담 시간 설정 API 응답 전체 구조:", JSON.stringify(consultationSlotsRes.data, null, 2));
      
      // API 응답 상태 확인
      console.log("📊 상담 시간 설정 API 응답 상태 분석:");
      console.log(`- 응답 상태: ${consultationSlotsRes.status}`);
      console.log(`- 데이터 존재: ${!!consultationSlotsRes.data}`);
      console.log(`- 데이터 타입: ${typeof consultationSlotsRes.data}`);
      if (consultationSlotsRes.data) {
        console.log(`- 데이터 키들: ${Object.keys(consultationSlotsRes.data)}`);
      }

      // 1. 멘토의 상담 시간 설정 (전체 상담 가능 시간) 추출
      let consultationSlots = [];
      
      // 상담 시간 설정 API 응답 구조 분석 및 데이터 추출
      if (consultationSlotsRes.data) {
        if (Array.isArray(consultationSlotsRes.data)) {
          consultationSlots = consultationSlotsRes.data;
        } else if (consultationSlotsRes.data.data && Array.isArray(consultationSlotsRes.data.data)) {
          consultationSlots = consultationSlotsRes.data.data;
        } else if (consultationSlotsRes.data.content && Array.isArray(consultationSlotsRes.data.content)) {
          consultationSlots = consultationSlotsRes.data.content;
        } else if (typeof consultationSlotsRes.data === 'object') {
          // 단일 객체인 경우 배열로 변환
          consultationSlots = [consultationSlotsRes.data];
        }
      }

      console.log("🧪 멘토 상담 시간 설정 (처리 후):", consultationSlots);

      // 2. 전체 예약 목록에서 해당 멘토, 해당 날짜의 예약만 필터링
      let allReservations = [];
      
      // 예약 목록 API 응답 구조 안전하게 처리
      if (reservationsRes.data) {
        if (Array.isArray(reservationsRes.data)) {
          allReservations = reservationsRes.data;
        } else if (reservationsRes.data.data && Array.isArray(reservationsRes.data.data)) {
          allReservations = reservationsRes.data.data;
        } else if (reservationsRes.data.content && Array.isArray(reservationsRes.data.content)) {
          allReservations = reservationsRes.data.content;
        } else if (reservationsRes.data.reservations && Array.isArray(reservationsRes.data.reservations)) {
          allReservations = reservationsRes.data.reservations;
        }
      }
      
      console.log("🧪 전체 예약 목록:", allReservations);
      console.log("🧪 예약 목록 타입:", typeof allReservations, "배열인가:", Array.isArray(allReservations));

      // 해당 멘토의 해당 날짜 예약만 필터링 (배열인 경우에만)
      const todayReservations = Array.isArray(allReservations) ? allReservations.filter(reservation => {
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
      }) : [];

      console.log(`📅 ${selectedDate}에 해당 멘토의 예약:`, todayReservations);

      // 3. 상담 시간 설정을 기반으로 시간 슬롯 처리
      // 클라이언트 사이드에서 예약된 시간을 제외하는 로직은 나중에 추가 가능
      
      if (Array.isArray(consultationSlots) && consultationSlots.length > 0) {
        console.log("📋 멘토 상담 시간 설정 처리 시작");

        // 시간 추출 - 다양한 필드명 지원
        const processedSlots = consultationSlots
        .map(slot => {
          let startTime = null;
          let endTime = null;

          // 다양한 필드명 시도 (예약 API에 맞춰 확장)
          const timeFields = [
            { start: 'startTime', end: 'endTime' },
            { start: 'availableStartTime', end: 'availableEndTime' },
            { start: 'slotStartTime', end: 'slotEndTime' },
            { start: 'start', end: 'end' },
            { start: 'from', end: 'to' },
            { start: 'startAt', end: 'endAt' },
            { start: 'availableStartAt', end: 'availableEndAt' },
            { start: 'consultationStartTime', end: 'consultationEndTime' },
            { start: 'start_time', end: 'end_time' },
            { start: 'time_start', end: 'time_end' }
          ];

          for (const field of timeFields) {
            if (slot[field.start] && slot[field.end]) {
              startTime = slot[field.start];
              endTime = slot[field.end];
              break;
            }
          }

          // 시간 형식 정규화 (HH:mm 형식으로 변환)
          if (startTime && endTime) {
            // "HH:mm:ss" 또는 "HH:mm" 형식을 "HH:mm"로 변환
            startTime = startTime.split(':').slice(0, 2).join(':');
            endTime = endTime.split(':').slice(0, 2).join(':');
            
            return {
              startTime,
              endTime,
              original: slot
            };
          }
          return null;
        })
        .filter(slot => slot !== null)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

        console.log("🔍 처리된 상담 시간들:", processedSlots);

        if (processedSlots.length > 0) {
          // 해당 요일의 모든 상담 시간 슬롯을 개별적으로 처리
          console.log(`🕒 ${dayOfWeek} (${selectedDate}) 상담 시간 슬롯들:`, processedSlots);

          // 연속된 시간대들을 찾아서 전체 상담 가능 범위 계산
          const timeRanges = [];
          let currentRange = null;
          
          // 시간 순서로 정렬된 슬롯들을 순회하면서 연속된 구간 찾기
          for (let i = 0; i < processedSlots.length; i++) {
            const slot = processedSlots[i];
            const nextSlot = processedSlots[i + 1];
            
            if (!currentRange) {
              currentRange = { start: slot.startTime, end: slot.endTime };
            }
            
            // 다음 슬롯이 현재 구간과 연속되는지 확인
            if (nextSlot && slot.endTime === nextSlot.startTime) {
              // 연속되면 끝 시간을 확장
              currentRange.end = nextSlot.endTime;
            } else {
              // 연속되지 않으면 현재 구간을 저장하고 새 구간 시작
              timeRanges.push(currentRange);
              currentRange = null;
            }
          }
          
          console.log(`📋 ${dayOfWeek} (${selectedDate}) 연속된 상담 시간 구간들:`, timeRanges);
          
          // 전체 범위 계산
          const earliestStart = timeRanges[0].start;
          const latestEnd = timeRanges[timeRanges.length - 1].end;
          
          console.log(`🕒 ${dayOfWeek} (${selectedDate}) 전체 상담 시간 범위: ${earliestStart} ~ ${latestEnd}`);

          // 10분 단위로 전체 상담 가능 시간 슬롯 생성 (연속된 구간들 기반)
          const allAvailableSlots = [];
          timeRanges.forEach(range => {
            const startTime = new Date(`2000-01-01T${range.start}:00`);
            const endTime = new Date(`2000-01-01T${range.end}:00`);
            
            let current = new Date(startTime);
            // 종료 시간까지 포함하도록 <= 사용 (22:00이면 22:00까지 포함)
            while (current <= endTime) {
              const hours = current.getHours().toString().padStart(2, '0');
              const minutes = current.getMinutes().toString().padStart(2, '0');
              const timeSlot = `${hours}:${minutes}`;
              
              // 종료 시간과 정확히 같으면 추가하지 않음 (시작 시간으로만 사용)
              if (timeSlot !== range.end) {
                allAvailableSlots.push(timeSlot);
              }
              
              current.setMinutes(current.getMinutes() + 10);
            }
          });
          
          console.log(`✅ ${dayOfWeek} (${selectedDate}) 생성된 예약 가능 시간: [${allAvailableSlots.join(', ')}]`);
          
          // 실제 사용 가능한 시간 슬롯들을 설정
          setConsultationSlots(allAvailableSlots);
          
          // 날짜별로 독립적으로 상담 시간 저장
          const startDateTime = `${selectedDate}T${earliestStart}:00`;
          const endDateTime = `${selectedDate}T${latestEnd}:00`;
          
          setConsultationStartAt(startDateTime);
          setConsultationEndAt(endDateTime);
          
          // 날짜별 상담 시간 캐시 업데이트
          setConsultationTimesByDate(prev => ({
            ...prev,
            [selectedDate]: {
              startAt: startDateTime,
              endAt: endDateTime,
              dayOfWeek: dayOfWeek,
              timeRanges: timeRanges,
              availableSlots: allAvailableSlots
            }
          }));
        } else {
          console.log(`❌ ${selectedDate} (${dayOfWeek}) 처리 가능한 시간 슬롯 없음`);
          console.log("🔍 원본 슬롯 데이터 분석:", consultationSlots);
          setConsultationStartAt(null);
          setConsultationEndAt(null);
          
          // 날짜별 상담 시간 캐시에서 해당 날짜 제거
          setConsultationTimesByDate(prev => {
            const updated = { ...prev };
            delete updated[selectedDate];
            return updated;
          });
        }
      } else {
        console.log(`📅 ${selectedDate} (${dayOfWeek}) 상담 시간 설정이 없음 - 상담 불가능한 날짜`);
        console.log("🔍 상담 시간 설정:", consultationSlots);

        // 상담 시간 설정이 없다는 것은 해당 요일에 상담이 불가능함을 의미
        setConsultationStartAt(null);
        setConsultationEndAt(null);
        
        // 날짜별 상담 시간 캐시에서 해당 날짜 제거
        setConsultationTimesByDate(prev => {
          const updated = { ...prev };
          delete updated[selectedDate];
          return updated;
        });

        console.log(`❌ ${selectedDate} (${dayOfWeek})에는 멘토가 상담 시간을 설정하지 않음`);
      }
    })
    .catch(err => {
      console.error(`❌ ${selectedDate} (${getDayOfWeek(selectedDate)}) 시간 조회 실패:`, err);

      // 에러 발생 시에도 상담 불가능으로 처리
      // API 호출 실패는 해당 날짜에 데이터가 없거나 서버 오류를 의미
      setConsultationStartAt(null);
      setConsultationEndAt(null);
      
      // 날짜별 상담 시간 캐시에서 해당 날짜 제거
      setConsultationTimesByDate(prev => {
        const updated = { ...prev };
        delete updated[selectedDate];
        return updated;
      });

      console.log(`⚠️ API 호출 실패로 인해 ${selectedDate}에는 상담 예약 불가`);
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



  // 3. 예약된 시간 제외하여 실제 사용 가능한 시간 슬롯 필터링
  useEffect(() => {
    // consultationTimesByDate에서 해당 날짜의 원본 슬롯 가져오기
    const dateData = consultationTimesByDate[selectedDate];
    if (!dateData || !dateData.availableSlots || dateData.availableSlots.length === 0) {
      return;
    }
    
    const originalSlots = dateData.availableSlots;
    console.log(`📋 ${selectedDate} 원본 상담 가능 시간:`, originalSlots);
    
    // 해당 날짜의 예약 목록 가져오기
    reservationAPI.getReservations()
      .then(reservationsRes => {
        let allReservations = [];
        
        if (reservationsRes.data) {
          if (Array.isArray(reservationsRes.data)) {
            allReservations = reservationsRes.data;
          } else if (reservationsRes.data.data && Array.isArray(reservationsRes.data.data)) {
            allReservations = reservationsRes.data.data;
          } else if (reservationsRes.data.content && Array.isArray(reservationsRes.data.content)) {
            allReservations = reservationsRes.data.content;
          } else if (reservationsRes.data.reservations && Array.isArray(reservationsRes.data.reservations)) {
            allReservations = reservationsRes.data.reservations;
          }
        }
        
        // 해당 멘토의 해당 날짜 예약만 필터링 (날짜 정확히 매칭)
        const todayReservations = Array.isArray(allReservations) ? allReservations.filter(reservation => {
          // 멘토 매칭
          const mentorMatches = reservation.mentor === mentor.userId ||
              reservation.mentorId === mentor.userId ||
              reservation.mentor?.id === mentor.userId;

          // 날짜 매칭 (정확한 날짜 비교)
          let reservationDate = null;
          if (reservation.reservationStartAt) {
            if (reservation.reservationStartAt.includes('T')) {
              reservationDate = reservation.reservationStartAt.split('T')[0];
            } else if (reservation.reservationStartAt.includes(' ')) {
              reservationDate = reservation.reservationStartAt.split(' ')[0];
            }
          }

          const dateMatches = reservationDate === selectedDate;
          
          console.log(`🔍 예약 체크: 멘토(${mentorMatches}) 날짜(${dateMatches}) - ${reservation.reservationStartAt} vs ${selectedDate}`);
          
          return mentorMatches && dateMatches;
        }) : [];
        
        console.log(`📅 ${selectedDate} 해당 날짜만의 예약 현황 (${todayReservations.length}건):`, todayReservations);
        
        if (todayReservations.length > 0) {
          // 예약된 시간 범위 추출
          const reservedTimeRanges = todayReservations.map(reservation => {
            let startTime = null;
            let endTime = null;
            
            if (reservation.reservationStartAt && reservation.reservationEndAt) {
              if (reservation.reservationStartAt.includes('T')) {
                startTime = reservation.reservationStartAt.split('T')[1].substring(0, 5);
              } else if (reservation.reservationStartAt.includes(' ')) {
                startTime = reservation.reservationStartAt.split(' ')[1].substring(0, 5);
              }
              
              if (reservation.reservationEndAt.includes('T')) {
                endTime = reservation.reservationEndAt.split('T')[1].substring(0, 5);
              } else if (reservation.reservationEndAt.includes(' ')) {
                endTime = reservation.reservationEndAt.split(' ')[1].substring(0, 5);
              }
            }
            
            return { startTime, endTime };
          }).filter(range => range.startTime && range.endTime);
          
          console.log(`⏰ ${selectedDate} 예약된 시간 범위:`, reservedTimeRanges);
          
          // 원본 슬롯에서 예약된 시간과 겹치지 않는 슬롯들만 필터링
          const availableSlots = originalSlots.filter(slot => {
            const isReserved = reservedTimeRanges.some(reserved => {
              return slot >= reserved.startTime && slot < reserved.endTime;
            });
            return !isReserved;
          });
          
          console.log(`✅ ${selectedDate} 예약 제외 후 사용 가능한 시간 (${availableSlots.length}개):`, availableSlots);
          setConsultationSlots(availableSlots);
        } else {
          // 예약이 없으면 원본 슬롯을 그대로 사용
          console.log(`✅ ${selectedDate} 예약 없음 - 원본 슬롯 사용 (${originalSlots.length}개)`);
          setConsultationSlots(originalSlots);
        }
      })
      .catch(err => {
        console.error(`❌ ${selectedDate} 예약 목록 조회 실패:`, err);
        // 오류 시에도 원본 슬롯을 사용
        setConsultationSlots(originalSlots);
      });
  }, [selectedDate, mentor?.userId, consultationTimesByDate]);

  // 4. 시작시간이 선택되면 종료시간 옵션 계산 (이용권 시간 제한 반영)
  useEffect(() => {
    if (!selectedStartTime || !consultationEndAt || !selectedDate) {
      setAvailableEndTimes([]);
      setSelectedEndTime('');
      return;
    }
    
    // 이용권이 선택되지 않은 경우 대기
    if (!selectedService) {
      setAvailableEndTimes([]);
      setSelectedEndTime('');
      return;
    }

    // 시작시간으로부터 가능한 종료시간들 계산
    reservationAPI.getReservations()
      .then(reservationsRes => {
        let allReservations = [];
        
        if (reservationsRes.data) {
          if (Array.isArray(reservationsRes.data)) {
            allReservations = reservationsRes.data;
          } else if (reservationsRes.data.data && Array.isArray(reservationsRes.data.data)) {
            allReservations = reservationsRes.data.data;
          } else if (reservationsRes.data.content && Array.isArray(reservationsRes.data.content)) {
            allReservations = reservationsRes.data.content;
          } else if (reservationsRes.data.reservations && Array.isArray(reservationsRes.data.reservations)) {
            allReservations = reservationsRes.data.reservations;
          }
        }
        
        // 해당 멘토의 해당 날짜 예약만 필터링
        const todayReservations = Array.isArray(allReservations) ? allReservations.filter(reservation => {
          const mentorMatches = reservation.mentor === mentor.userId ||
              reservation.mentorId === mentor.userId ||
              reservation.mentor?.id === mentor.userId;

          let reservationDate = null;
          if (reservation.reservationStartAt) {
            if (reservation.reservationStartAt.includes('T')) {
              reservationDate = reservation.reservationStartAt.split('T')[0];
            } else if (reservation.reservationStartAt.includes(' ')) {
              reservationDate = reservation.reservationStartAt.split(' ')[0];
            }
          }

          const dateMatches = reservationDate === selectedDate;
          return mentorMatches && dateMatches;
        }) : [];
        
        const endTimes = calculateAvailableEndTimes(selectedStartTime, consultationEndAt, todayReservations);
        setAvailableEndTimes(endTimes);
        
        // 현재 선택된 종료시간이 새로운 옵션에 없으면 초기화
        if (selectedEndTime && !endTimes.includes(selectedEndTime)) {
          setSelectedEndTime('');
        }
      })
      .catch(err => {
        console.error('종료시간 계산을 위한 예약 목록 조회 실패:', err);
        setAvailableEndTimes([]);
        setSelectedEndTime('');
      });
  }, [selectedStartTime, consultationEndAt, selectedDate, mentor?.userId, selectedService, serviceOptions]);

  function generateConsultationSlots(startAt, endAt, reservations = []) {
    if (!startAt || !endAt) return [];
    const result = [];
    let start = new Date(startAt);
    const end = new Date(endAt);
    const now = new Date();

    // 선택된 날짜가 오늘인지 확인
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDateObj.toDateString() === now.toDateString();

    // Reset seconds and milliseconds for precise comparison
    start.setSeconds(0, 0);
    end.setSeconds(0, 0);

    console.log(`📅 시간 슬롯 생성: ${selectedDate} (${getDayOfWeek(selectedDate)})`);
    console.log(`⏰ 상담 시간 범위: ${start.toLocaleTimeString()} ~ ${end.toLocaleTimeString()}`);

    // 오늘인 경우 현재 시간 이후의 슬롯만 생성
    if (isToday) {
      const currentTime = new Date();
      currentTime.setSeconds(0, 0);
      const originalCurrentTime = new Date(currentTime);
      
      // 현재 시간을 10분 단위로 올림 처리
      const currentMinutes = currentTime.getMinutes();
      const roundedMinutes = Math.ceil(currentMinutes / 10) * 10;
      currentTime.setMinutes(roundedMinutes);

      console.log(`🕐 실제 현재 시간: ${originalCurrentTime.toLocaleTimeString()}`);
      console.log(`🕐 10분 단위 올림 처리된 시간: ${currentTime.toLocaleTimeString()}`);
      console.log(`📅 상담 시작 시간: ${start.toLocaleTimeString()}`);

      // 시작 시간이 현재 시간보다 이전이면 현재 시간으로 조정
      if (start < currentTime) {
        const originalStart = new Date(start);
        start = new Date(currentTime);
        console.log(`⏰ 시작 시간 조정: ${originalStart.toLocaleTimeString()} → ${start.toLocaleTimeString()}`);
      } else {
        console.log(`✅ 시작 시간이 현재 시간 이후이므로 조정 불필요`);
      }
    } else {
      console.log(`📅 선택된 날짜가 오늘이 아님: ${selectedDate}`);
    }

    // 예약된 시간 범위들을 파싱
    const reservedTimeRanges = reservations.map(reservation => {
      let startTime = null;
      let endTime = null;
      
      if (reservation.reservationStartAt && reservation.reservationEndAt) {
        // 시간 부분 추출 (HH:mm 형식)
        if (reservation.reservationStartAt.includes('T')) {
          startTime = reservation.reservationStartAt.split('T')[1].substring(0, 5);
        } else if (reservation.reservationStartAt.includes(' ')) {
          startTime = reservation.reservationStartAt.split(' ')[1].substring(0, 5);
        }
        
        if (reservation.reservationEndAt.includes('T')) {
          endTime = reservation.reservationEndAt.split('T')[1].substring(0, 5);
        } else if (reservation.reservationEndAt.includes(' ')) {
          endTime = reservation.reservationEndAt.split(' ')[1].substring(0, 5);
        }
      }
      
      return { startTime, endTime };
    }).filter(range => range.startTime && range.endTime);

    console.log(`📅 ${selectedDate} 예약된 시간 범위:`, reservedTimeRanges);

    // 시간이 예약된 범위와 겹치는지 확인하는 함수
    const isTimeReserved = (timeStr) => {
      return reservedTimeRanges.some(range => {
        // 시간 슬롯이 예약 시간 범위와 겹치는지 확인
        // 예약 시작 시간부터 종료 시간 전까지는 모두 예약된 것으로 간주
        return timeStr >= range.startTime && timeStr < range.endTime;
      });
    };

    // 시간 범위가 예약과 겹치는지 확인하는 함수 (20분 최소 시간 고려)
    const isTimeRangeReserved = (startTimeStr, durationMinutes = 20) => {
      const startHour = parseInt(startTimeStr.split(':')[0]);
      const startMinute = parseInt(startTimeStr.split(':')[1]);
      
      // 시작 시간부터 최소 duration만큼의 시간이 모두 비어있는지 확인
      for (let i = 0; i < durationMinutes; i += 10) {
        const checkMinute = startMinute + i;
        const checkHour = startHour + Math.floor(checkMinute / 60);
        const normalizedMinute = checkMinute % 60;
        
        const timeToCheck = `${checkHour.toString().padStart(2, '0')}:${normalizedMinute.toString().padStart(2, '0')}`;
        
        if (isTimeReserved(timeToCheck)) {
          return true;
        }
      }
      return false;
    };

    // 종료 시간까지 포함하도록 수정 (<=를 사용하여 16:00까지 포함)
    console.log(`🔄 시간 슬롯 생성 시작: ${start.toLocaleTimeString()} ~ ${end.toLocaleTimeString()}`);
    let slotCount = 0;
    
    while (start <= end) {
      const minutes = start.getMinutes();
      if (minutes % 10 === 0) {
        const hours = start.getHours().toString().padStart(2, '0');
        const mins = minutes.toString().padStart(2, '0');
        const timeSlot = `${hours}:${mins}`;
        
        slotCount++;
        console.log(`🕘 체크 중인 슬롯 ${slotCount}: ${timeSlot}`);
        
        // 해당 시간부터 최소 20분이 확보 가능한지 확인 (시작시간으로 선택 가능한지)
        if (!isTimeRangeReserved(timeSlot, 20)) {
          result.push(timeSlot);
          console.log(`✅ 사용 가능한 슬롯: ${timeSlot}`);
        } else {
          console.log(`❌ 예약으로 인해 시작시간 불가: ${timeSlot}`);
        }
      }
      start.setMinutes(start.getMinutes() + 10); // 10분 단위로 증가하도록 수정
    }

    console.log(`✅ ${selectedDate} (${getDayOfWeek(selectedDate)}) 최종 예약 가능한 시간 슬롯 (${result.length}개):`, result);
    return result;
  }

  function calculateAvailableEndTimes(startTime, consultationEndAt, reservations = []) {
    if (!startTime || !consultationEndAt) return [];
    
    const result = [];
    const endDateTime = new Date(consultationEndAt);
    
    // 시작 시간을 Date 객체로 변환
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    // 선택된 서비스(이용권)의 시간 제한 적용
    let maxDuration = null;
    if (selectedService) {
      const selectedTicket = serviceOptions.find(option => option.id === selectedService);
      if (selectedTicket && selectedTicket.duration) {
        // ENUM 값에서 시간 추출 (MINUTES_20 -> 20, MINUTES_30 -> 30, MINUTES_40 -> 40)
        const durationMatch = selectedTicket.duration.match(/MINUTES_(\d+)/);
        if (durationMatch) {
          maxDuration = parseInt(durationMatch[1]);
        }
      }
    }
    
    // 최소 20분부터 시작
    let currentTime = new Date(startDateTime);
    currentTime.setMinutes(currentTime.getMinutes() + 20);
    
    // 예약된 시간 범위들을 파싱
    const reservedTimeRanges = reservations.map(reservation => {
      let reservationStartTime = null;
      let reservationEndTime = null;
      
      if (reservation.reservationStartAt && reservation.reservationEndAt) {
        if (reservation.reservationStartAt.includes('T')) {
          reservationStartTime = reservation.reservationStartAt.split('T')[1].substring(0, 5);
        } else if (reservation.reservationStartAt.includes(' ')) {
          reservationStartTime = reservation.reservationStartAt.split(' ')[1].substring(0, 5);
        }
        
        if (reservation.reservationEndAt.includes('T')) {
          reservationEndTime = reservation.reservationEndAt.split('T')[1].substring(0, 5);
        } else if (reservation.reservationEndAt.includes(' ')) {
          reservationEndTime = reservation.reservationEndAt.split(' ')[1].substring(0, 5);
        }
      }
      
      return { startTime: reservationStartTime, endTime: reservationEndTime };
    }).filter(range => range.startTime && range.endTime);

    console.log(`🕒 시작시간: ${startTime}, 예약 범위:`, reservedTimeRanges);
    
    // 시간 범위가 예약과 겹치는지 확인 (시작~종료 전체 구간 체크)
    const isTimeRangeConflicted = (start, end) => {
      // 시작 시간부터 종료 시간까지의 모든 10분 구간이 예약과 겹치지 않는지 확인
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      // 10분 단위로 각 구간이 예약된 시간과 겹치는지 확인
      for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 10) {
        const checkHour = Math.floor(minutes / 60);
        const checkMinute = minutes % 60;
        const timeToCheck = `${checkHour.toString().padStart(2, '0')}:${checkMinute.toString().padStart(2, '0')}`;
        
        // 이 시간이 예약된 시간 범위에 포함되는지 확인
        const isConflicted = reservedTimeRanges.some(reserved => {
          return timeToCheck >= reserved.startTime && timeToCheck < reserved.endTime;
        });
        
        if (isConflicted) {
          return true; // 하나라도 겹치면 충돌
        }
      }
      
      return false; // 모든 구간이 비어있으면 충돌 없음
    };
    
    // 상담 종료 시간까지 10분 단위로 체크 (종료 시간 포함)
    // 이용권 시간 제한이 있는 경우 더 짧은 제한 시간 적용
    const maxEndTime = maxDuration ? 
      new Date(startDateTime.getTime() + maxDuration * 60 * 1000) : 
      endDateTime;
    
    const finalEndTime = maxEndTime < endDateTime ? maxEndTime : endDateTime;
    
    while (currentTime <= finalEndTime) {
      const minutes = currentTime.getMinutes();
      if (minutes % 10 === 0) {
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const mins = minutes.toString().padStart(2, '0');
        const endTimeStr = `${hours}:${mins}`;
        
        // 최소 20분 이상의 예약 시간 확보
        const startHour = parseInt(startTime.split(':')[0]);
        const startMinute = parseInt(startTime.split(':')[1]);
        const endHour = parseInt(endTimeStr.split(':')[0]);
        const endMinute = parseInt(endTimeStr.split(':')[1]);
        
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;
        const durationMinutes = endTotalMinutes - startTotalMinutes;
        
        // 최소 20분 이상이고 예약 충돌이 없는 경우에만 추가
        // 이용권 시간 제한도 확인
        const withinTicketLimit = !maxDuration || durationMinutes <= maxDuration;
        
        if (durationMinutes >= 20 && withinTicketLimit && !isTimeRangeConflicted(startTime, endTimeStr)) {
          result.push(endTimeStr);
        } else if (durationMinutes < 20) {
          console.log(`⏰ 최소 시간 미달: ${startTime} ~ ${endTimeStr} (${durationMinutes}분)`);
        } else if (!withinTicketLimit) {
          console.log(`⏰ 이용권 시간 초과: ${startTime} ~ ${endTimeStr} (${durationMinutes}분 > ${maxDuration}분)`);
        } else {
          console.log(`⏰ 예약 충돌로 종료시간 불가: ${startTime} ~ ${endTimeStr}`);
          // 충돌이 발생해도 break하지 않고 계속 확인 (나중에 빈 시간이 있을 수 있음)
        }
      }
      currentTime.setMinutes(currentTime.getMinutes() + 10);
    }
    
    console.log(`✅ ${startTime}부터 가능한 종료시간:`, result);
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
  const isPastDate = (year, month, day) => {
    const today = new Date();
    const dateToCheck = new Date(year, month, day);
    today.setHours(0, 0, 0, 0);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
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
      const isPast = isPastDate(year, month, day);

      // 선택된 날짜가 있으면 오늘 표시를 하지 않음 (어떤 날짜든 선택되면 today 스타일 제거)
      const shouldShowToday = isCurrentDay && !selectedDate;

      days.push(
          <div
              key={day}
              className={`calendar-day ${shouldShowToday ? 'today' : ''} ${isSelectedDay ? 'selected' : ''} ${isPast ? 'disabled' : ''}`}
              onClick={() => !isPast && setSelectedDate(formatDate(year, month, day))}
              style={isPast ? { cursor: 'not-allowed', opacity: 0.5 } : { cursor: 'pointer' }}
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

    // 4. 과거 시간 예약 방지
    const now = new Date();
    const selectedDateTime = new Date(`${selectedDate}T${selectedStartTime}:00`);

    if (selectedDateTime <= now) {
      alert('과거 시간에는 예약할 수 없습니다. 현재 시간 이후의 시간을 선택해주세요.');
      return;
    }

    // 5. 로그인 상태 확인
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
                        ? `${consultationSlots[0]} ~ ${consultationEndAt ? new Date(consultationEndAt).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit', hour12: false}) : consultationSlots[consultationSlots.length-1]}`
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
                    disabled={!selectedStartTime || availableEndTimes.length === 0}
                >
                  <option value="">종료 시간</option>
                  {availableEndTimes.map((slot, idx) => (
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

