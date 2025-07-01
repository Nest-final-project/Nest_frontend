import sseService from './sseService';
import { accessTokenUtils } from '../utils/tokenUtils';

class NotificationService {
  constructor() {
    this.listeners = new Map();
    this.isConnected = false;
  }

  // SSE 연결 시작
  connect() {
    const accessToken = accessTokenUtils.getAccessToken();
    
    console.log('=== 알림 서비스 연결 시작 ===');
    console.log('Access Token 존재:', !!accessToken);
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('SSE Endpoint:', import.meta.env.VITE_SSE_ENDPOINT || '/sse/notifications/subscribe');
    
    if (!accessToken) {
      console.warn('❌ Access token이 없어 알림 서비스 연결 불가');
      this.notifyListeners('connection', { status: 'failed', reason: 'no_token' });
      return;
    }

    // SSE 서비스를 사용하여 연결
    sseService.connect(
      accessToken,
      this.handleMessage.bind(this), // 메시지 수신 콜백
      this.handleError.bind(this),   // 에러 콜백
      this.handleOpen.bind(this)     // 연결 성공 콜백
    );
  }

  // SSE 연결 종료
  disconnect() {
    sseService.disconnect();
    this.isConnected = false;
    this.notifyListeners('connection', { status: 'disconnected' });
  }

  // 연결 성공 처리
  handleOpen(event) {
    console.log('✅ 알림 서비스 연결 성공');
    this.isConnected = true;
    this.notifyListeners('connection', { status: 'connected' });
  }

  // 메시지 수신 처리
  handleMessage(event) {
    console.log('📨 알림 메시지 수신:', event);
    
    try {
      // 특별한 이벤트 타입이 있는 경우 처리
      if (event.eventType === 'chat-termination') {
        console.log('🔥 채팅 종료 알림 처리');
        const notificationData = event.parsedData || JSON.parse(event.data);
        this.handleChatTerminationNotification(notificationData);
        return;
      }

      if (event.eventType === 'chat-open') {
        console.log('🚀 채팅 시작 알림 처리');
        const notificationData = event.parsedData || JSON.parse(event.data);
        this.handleChatStartNotification(notificationData);
        return;
      }

      // 일반 메시지 처리
      const notification = JSON.parse(event.data);
      console.log('📄 일반 알림 처리:', notification);
      this.handleNotification(notification);
    } catch (error) {
      console.error('❌ 알림 데이터 파싱 오류:', error, event);
    }
  }

  // 에러 처리
  handleError(event) {
    console.error('❌ 알림 서비스 연결 오류:', event);
    this.isConnected = false;
    
    // SSE 서비스가 재연결을 처리하므로 여기서는 상태만 업데이트
    if (!sseService.isConnected()) {
      this.notifyListeners('connection', { status: 'error' });
    }
  }

  // 알림 처리
  handleNotification(notification) {
    // 채팅 관련 알림만 처리하도록 제한
    switch (notification.type) {
      case 'chat_termination':
      case 'chat-termination':
        this.handleChatTerminationNotification(notification);
        break;
      case 'chat_start':
      case 'chat-open':
        this.handleChatStartNotification(notification);
        break;
      // 다른 알림 타입들은 주석 처리하여 비활성화
      // case 'session_ending':
      //   this.handleSessionEndingNotification(notification);
      //   break;
      // case 'new_message':
      //   this.handleNewMessageNotification(notification);
      //   break;
      // case 'system_update':
      //   this.handleSystemUpdateNotification(notification);
      //   break;
      default:
        console.log('처리하지 않는 알림 타입:', notification.type);
        // 기본 알림도 비활성화
        // this.notifyListeners('notification', notification);
        break;
    }
  }

  // 세션 종료 5분 전 알림
  handleSessionEndingNotification(notification) {
    const sessionNotification = {
      id: `session_${Date.now()}`,
      type: 'session',
      title: '세션 종료 알림',
      message: `멘토링 세션이 ${notification.remainingMinutes}분 후 종료됩니다. 마무리 준비를 해주세요.`,
      timestamp: new Date().toISOString(),
      actions: [
        {
          label: '연장 요청',
          type: 'primary',
          onClick: () => this.requestSessionExtension(notification.sessionId)
        },
        {
          label: '확인',
          type: 'secondary',
          onClick: () => {}
        }
      ]
    };

    this.notifyListeners('notification', sessionNotification);
  }

  // 새 메시지 알림
  handleNewMessageNotification(notification) {
    const messageNotification = {
      id: `message_${Date.now()}`,
      type: 'chat',
      title: '새 메시지',
      message: `${notification.senderName}님이 새 메시지를 보냈습니다.`,
      timestamp: new Date().toISOString(),
      actions: [
        {
          label: '채팅 보기',
          type: 'primary',
          onClick: () => this.openChat(notification.chatId)
        }
      ]
    };

    this.notifyListeners('notification', messageNotification);
  }

  // 시스템 업데이트 알림
  handleSystemUpdateNotification(notification) {
    const updateNotification = {
      id: `update_${Date.now()}`,
      type: 'info',
      title: '시스템 업데이트',
      message: notification.message || '새로운 기능이 추가되었습니다.',
      timestamp: new Date().toISOString(),
      actions: [
        {
          label: '새로고침',
          type: 'primary',
          onClick: () => window.location.reload()
        },
        {
          label: '나중에',
          type: 'secondary',
          onClick: () => {}
        }
      ]
    };

    this.notifyListeners('notification', updateNotification);
  }

  // 채팅 종료 알림
  handleChatTerminationNotification(notification) {
    const terminationNotification = {
      id: `termination_${Date.now()}`,
      type: 'warning',
      style: 'termination',
      title: '채팅 종료 알림',
      timestamp: notification.createdAt || new Date().toISOString(),
      terminationData: {
        content: notification.content || notification.message || '멘토링 세션이 곧 종료됩니다.',
        endTime: notification.endTime || null // 종료 시간이 있다면 포함
      }
    };

    this.notifyListeners('notification', terminationNotification);
  }

  // 채팅 시작 알림
  async handleChatStartNotification(notification) {
    console.log('🚀 채팅 시작 알림 처리 시작');
    console.log('📨 받은 notification 객체:', notification);
    console.log('📨 notification 타입:', typeof notification);
    console.log('📨 notification 키들:', Object.keys(notification));
    
    const chatRoomId = notification.chatRoomId || notification.roomId || notification.id;
    const reservationId = notification.reservationId || notification.reservation_id || notification.reservationID;
    
    console.log('🔍 추출된 데이터:');
    console.log('  - chatRoomId:', chatRoomId, '(타입:', typeof chatRoomId, ')');
    console.log('  - reservationId:', reservationId, '(타입:', typeof reservationId, ')');
    
    // 추가 가능한 필드들도 확인
    console.log('🔍 기타 가능한 필드들:');
    console.log('  - notification.roomId:', notification.roomId);
    console.log('  - notification.reservation_id:', notification.reservation_id);
    console.log('  - notification.reservationID:', notification.reservationID);
    console.log('  - notification.mentorId:', notification.mentorId);
    console.log('  - notification.menteeId:', notification.menteeId);
    
    try {
      // 채팅방 ID가 없으면 에러
      if (!chatRoomId) {
        console.error('❌ chatRoomId가 없습니다!', notification);
        // 그래도 기본 알림은 표시
        await this.showChatRoomCreatedNotification('UNKNOWN_ROOM', reservationId);
        return;
      }
      
      // 항상 상세 토스트 표시 (예약 ID가 없어도 기본값으로)
      await this.showChatRoomCreatedNotification(chatRoomId, reservationId);
    } catch (error) {
      console.error('채팅 시작 알림 처리 오류:', error);
      console.error('오류 스택:', error.stack);
      // 오류 시에도 상세 토스트 표시 (기본값으로)
      await this.showChatRoomCreatedNotification(chatRoomId || 'ERROR_ROOM', null);
    }
  }

  // 예약 정보 포함 채팅방 생성 토스트 (상세 토스트만 사용)
  async showChatRoomCreatedNotification(chatRoomId, reservationId = null) {
    console.log('💬 채팅방 생성 토스트 표시 시작:', { chatRoomId, reservationId, type: typeof reservationId });
    
    let reservationData = null;
    let apiError = null;
    let currentUserId = null;
    let currentUserRole = null;
    
    // 현재 로그인한 사용자 정보 가져오기
    try {
      const accessToken = accessTokenUtils.getAccessToken();
      if (accessToken) {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        currentUserId = parseInt(payload.sub || payload.userId || payload.id);
        currentUserRole = payload.role || payload.userRole || payload.authorities?.[0];
        console.log('👤 현재 사용자 정보:', { currentUserId, currentUserRole });
      }
    } catch (error) {
      console.error('❌ 현재 사용자 정보 추출 실패:', error);
    }
    
    // 예약 ID가 있으면 예약 정보 조회 (멘티만 가능, 멘토는 권한 없음)
    if (reservationId) {
      try {
        console.log('🔍 예약 정보 API 호출 중...', reservationId);
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const accessToken = accessTokenUtils.getAccessToken();
        
        console.log('🌐 환경 변수 확인:');
        console.log('  - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
        console.log('  - 사용될 baseUrl:', baseUrl);
        console.log('  - accessToken 존재:', !!accessToken);
        console.log('  - accessToken 형태:', accessToken ? (accessToken.startsWith('Bearer') ? 'Bearer 포함' : 'Bearer 미포함') : '없음');
        
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        if (accessToken) {
          headers.Authorization = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
        } else {
          console.warn('⚠️ Access Token이 없습니다!');
        }
        
        console.log('🌐 요청 헤더:', headers);
        
        const apiUrl = `${baseUrl}/api/reservations/${reservationId}`;
        console.log('🌐 최종 API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: headers
        });
        
        console.log('🌐 API 응답 상태:', response.status, response.statusText);
        console.log('🌐 응답 헤더:', Object.fromEntries(response.headers.entries()));
        
        // 응답 본문을 text로 먼저 받아서 확인
        const responseText = await response.text();
        console.log('🌐 응답 본문 (원본):', responseText);
        
        if (response.ok) {
          try {
            const data = JSON.parse(responseText);
            reservationData = data.data || data; // API 응답 구조에 따라 조정
            console.log('✅ 예약 정보 조회 성공!');
            console.log('🔍 파싱된 데이터:', data);
            console.log('🔍 추출된 reservationData:', reservationData);
            
            // 상대방과 티켓 정보를 추가로 조회
            if (reservationData) {
              console.log('🔍 추가 정보 조회 시작...');
              
              // 현재 사용자에 따라 상대방 결정
              let partnerUserId = null;
              let partnerRole = null;
              
              if (currentUserId && reservationData.mentor && reservationData.mentee) {
                if (currentUserId === reservationData.mentor) {
                  // 현재 사용자가 멘토 → 멘티 정보 조회
                  partnerUserId = reservationData.mentee;
                  partnerRole = 'MENTEE';
                  console.log('👤 현재 사용자는 멘토 → 멘티 정보 조회:', partnerUserId);
                } else if (currentUserId === reservationData.mentee) {
                  // 현재 사용자가 멘티 → 멘토 정보 조회
                  partnerUserId = reservationData.mentor;
                  partnerRole = 'MENTOR';
                  console.log('👤 현재 사용자는 멘티 → 멘토 정보 조회:', partnerUserId);
                } else {
                  // 일치하지 않는 경우 기본적으로 멘토 정보 조회
                  partnerUserId = reservationData.mentor;
                  partnerRole = 'MENTOR';
                  console.warn('⚠️ 사용자 ID 불일치 - 기본적으로 멘토 정보 조회');
                }
              } else {
                // 정보가 부족한 경우 기본적으로 멘토 정보 조회
                partnerUserId = reservationData.mentor;
                partnerRole = 'MENTOR';
                console.warn('⚠️ 사용자 정보 부족 - 기본적으로 멘토 정보 조회');
              }
              
              // 상대방(파트너) 정보 조회
              if (partnerUserId) {
                try {
                  console.log(`👥 ${partnerRole} 정보 조회 중...`, partnerUserId);
                  const partnerResponse = await fetch(`${baseUrl}/api/users/${partnerUserId}`, { headers });
                  if (partnerResponse.ok) {
                    const partnerText = await partnerResponse.text();
                    const partnerData = JSON.parse(partnerText);
                    reservationData.partnerInfo = partnerData.data || partnerData;
                    reservationData.partnerInfo.role = partnerRole; // 역할 정보 추가
                    console.log('✅ 상대방 정보 조회 성공:', reservationData.partnerInfo);
                  } else {
                    console.warn('⚠️ 상대방 정보 조회 실패:', partnerResponse.status);
                    // 실패 시 기본값 설정
                    reservationData.partnerInfo = { 
                      name: partnerRole === 'MENTOR' ? '멘토' : '멘티', 
                      role: partnerRole 
                    };
                  }
                } catch (partnerError) {
                  console.error('❌ 상대방 정보 조회 오류:', partnerError);
                  // 오류 시 기본값 설정
                  reservationData.partnerInfo = { 
                    name: partnerRole === 'MENTOR' ? '멘토' : '멘티', 
                    role: partnerRole 
                  };
                }
              }
              
              // 티켓 정보 조회 (올바른 엔드포인트 사용)
              if (reservationData.ticket) {
                try {
                  console.log('🎫 티켓 정보 조회 중...', reservationData.ticket);
                  const ticketResponse = await fetch(`${baseUrl}/api/ticket/${reservationData.ticket}`, { headers });
                  if (ticketResponse.ok) {
                    const ticketText = await ticketResponse.text();
                    const ticketData = JSON.parse(ticketText);
                    reservationData.ticketInfo = ticketData.data || ticketData;
                    console.log('✅ 티켓 정보 조회 성공:', reservationData.ticketInfo);
                  } else {
                    console.warn('⚠️ 티켓 정보 조회 실패:', ticketResponse.status);
                    // 실패 시 기본값 설정
                    reservationData.ticketInfo = { name: '멘토링 상담', title: '멘토링 상담' };
                  }
                } catch (ticketError) {
                  console.error('❌ 티켓 정보 조회 오류:', ticketError);
                  // 오류 시 기본값 설정
                  reservationData.ticketInfo = { name: '멘토링 상담', title: '멘토링 상담' };
                }
              }
              
              console.group('📋 최종 예약 데이터 구조 분석');
              console.log('reservationData 키들:', Object.keys(reservationData));
              console.log('현재 사용자 ID:', currentUserId);
              console.log('현재 사용자 역할:', currentUserRole);
              console.log('mentor ID:', reservationData.mentor);
              console.log('mentee ID:', reservationData.mentee);
              console.log('상대방 ID:', partnerUserId);
              console.log('상대방 역할:', partnerRole);
              console.log('partnerInfo:', reservationData.partnerInfo);
              console.log('ticket ID:', reservationData.ticket);
              console.log('ticketInfo:', reservationData.ticketInfo);
              console.log('date (from reservationStartAt):', reservationData.reservationStartAt?.split(' ')[0]);
              console.log('startTime (from reservationStartAt):', reservationData.reservationStartAt?.split(' ')[1]?.substring(0, 5));
              console.log('endTime (from reservationEndAt):', reservationData.reservationEndAt?.split(' ')[1]?.substring(0, 5));
              console.groupEnd();
            }
          } catch (parseError) {
            console.error('❌ JSON 파싱 오류:', parseError);
            console.error('❌ 파싱 실패한 텍스트:', responseText);
            apiError = `JSON 파싱 실패: ${parseError.message}`;
          }
        } else {
          console.error('❌ API 호출 실패:', response.status, response.statusText);
          console.error('❌ 오류 응답 내용:', responseText);
          apiError = `API 호출 실패 (${response.status}): ${responseText}`;
        }
      } catch (error) {
        console.error('❌ 예약 정보 조회 중 네트워크 오류:', error);
        console.error('❌ 오류 스택:', error.stack);
        apiError = `네트워크 오류: ${error.message}`;
      }
    } else {
      console.warn('⚠️ reservationId가 없습니다. 예약 정보 조회를 건너뜁니다.');
      apiError = 'reservationId가 제공되지 않음';
    }

    // 항상 상세 토스트 표시 (예약 정보 조회 결과에 따라 다르게 표시)
    console.log('🎨 상세 토스트 생성 중...');
    console.log('🔍 최종 reservationData:', reservationData);
    console.log('🔍 API 에러:', apiError);
    
    // 시간 파싱 함수
    const parseDateTime = (dateTimeStr) => {
      if (!dateTimeStr) return { date: null, time: null };
      const [date, time] = dateTimeStr.split(' ');
      return { date, time: time?.substring(0, 5) }; // HH:MM 형태로
    };
    
    const startDateTime = parseDateTime(reservationData?.reservationStartAt);
    const endDateTime = parseDateTime(reservationData?.reservationEndAt);
    
    const detailedNotification = {
      id: `chat_created_${Date.now()}`,
      type: 'success',
      style: 'detailed',
      title: '멘토링 채팅방이 준비되었습니다!',
      chatRoomId: chatRoomId,
      timestamp: new Date().toISOString(),
      reservationData: {
        // 상대방 이름 표시 (멘토 로그인 시 → 멘티 이름, 멘티 로그인 시 → 멘토 이름)
        partnerName: reservationData?.partnerInfo?.name || 
                    (reservationData?.partnerInfo?.role === 'MENTOR' ? '멘토' : '멘티') ||
                    (apiError ? '상대방 정보를 불러올 수 없습니다' : '상대방 정보 없음'),
        partnerRole: reservationData?.partnerInfo?.role || 'UNKNOWN',
        serviceName: reservationData?.ticketInfo?.name || 
                    reservationData?.ticketInfo?.title ||
                    reservationData?.serviceName || 
                    reservationData?.ticketName || 
                    '멘토링 서비스',
        date: startDateTime.date || reservationData?.date || '날짜 정보 없음',
        startTime: startDateTime.time || reservationData?.startTime || '시간 정보 없음',
        endTime: endDateTime.time || reservationData?.endTime || '시간 정보 없음',
        // 사용자에게 유용한 정보만 포함
        reservationId: reservationData?.id || reservationId,
        status: reservationData?.reservationStatus === 'PAID' ? '결제 완료' : 
                reservationData?.reservationStatus === 'PENDING' ? '결제 대기' :
                reservationData?.reservationStatus === 'CANCELLED' ? '취소됨' :
                reservationData?.reservationStatus || '상태 확인 중',
        duration: this.calculateDurationFromTimes(startDateTime.time, endDateTime.time)
      },
      actionText: '멘토링 시작하기',
      // 디버깅 정보 추가 (개발자용)
      _debug: {
        originalReservationData: reservationData,
        apiError: apiError,
        reservationId: reservationId,
        chatRoomId: chatRoomId,
        parsedStartDateTime: startDateTime,
        parsedEndDateTime: endDateTime,
        // 사용자 및 상대방 정보 (디버깅용)
        currentUserId: currentUserId,
        currentUserRole: currentUserRole,
        mentorId: reservationData?.mentor,
        menteeId: reservationData?.mentee,
        partnerInfo: reservationData?.partnerInfo,
        ticketInfo: reservationData?.ticketInfo
      }
    };
    
    console.log('✅ 생성된 토스트 데이터:', detailedNotification);
    console.log('🔍 토스트 예약 정보:');
    console.log('  - 상대방 이름:', detailedNotification.reservationData.partnerName);
    console.log('  - 상대방 역할:', detailedNotification.reservationData.partnerRole);
    console.log('  - 서비스명:', detailedNotification.reservationData.serviceName);
    console.log('  - 날짜:', detailedNotification.reservationData.date);
    console.log('  - 시작시간:', detailedNotification.reservationData.startTime);
    console.log('  - 종료시간:', detailedNotification.reservationData.endTime);
    console.log('  - 예약상태:', detailedNotification.reservationData.status);
    console.log('  - 소요시간:', detailedNotification.reservationData.duration);
    
    this.notifyListeners('notification', detailedNotification);
  }

  // 세션 연장 요청
  async requestSessionExtension(sessionId) {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const accessToken = accessTokenUtils.getAccessToken();
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        if (accessToken.startsWith('Bearer ')) {
          headers.Authorization = accessToken;
        } else {
          headers.Authorization = `Bearer ${accessToken}`;
        }
      }
      
      const response = await fetch(`${baseUrl}/api/sessions/extend`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ sessionId, extensionMinutes: 15 })
      });

      if (response.ok) {
        const result = await response.json();
        this.notifyListeners('notification', {
          id: `extension_${Date.now()}`,
          type: 'success',
          title: '연장 요청 완료',
          message: '멘토에게 연장 요청이 전송되었습니다.',
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('연장 요청 실패');
      }
    } catch (error) {
      console.error('세션 연장 요청 오류:', error);
      this.notifyListeners('notification', {
        id: `extension_error_${Date.now()}`,
        type: 'error',
        title: '연장 요청 실패',
        message: '연장 요청 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date().toISOString()
      });
    }
  }

  // 채팅방 열기
  openChatRoom(chatRoomId) {
    // React Router를 사용하여 채팅방으로 이동
    if (chatRoomId) {
      window.location.href = `/chat/${chatRoomId}`;
    } else {
      console.error('채팅방 ID가 없습니다.');
    }
  }

  // 채팅방 열기 (기존 메서드 - 호환성 유지)
  openChat(chatId) {
    this.openChatRoom(chatId);
  }

  // 연결 상태 확인
  isServiceConnected() {
    return sseService.isConnected();
  }

  // 재연결 활성화
  enableReconnect() {
    sseService.enableReconnect();
  }

  // 이벤트 리스너 등록
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // 이벤트 리스너 제거
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 리스너들에게 알림
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('리스너 실행 오류:', error);
        }
      });
    }
  }

  // 테스트용 알림 생성 (개발 환경에서만) - 비활성화
  createTestNotifications() {
    // 테스트 알림 비활성화 - 채팅 종료 알림만 받도록 함
    console.log('테스트 알림 비활성화됨 - 채팅 종료 알림만 수신');
    return;
    
    if (import.meta.env.MODE !== 'development') return;

    // 5초 후 세션 종료 알림
    setTimeout(() => {
      this.handleNotification({
        type: 'session_ending',
        remainingMinutes: 5,
        sessionId: 'test_session_123'
      });
    }, 3000);

    // 8초 후 새 메시지 알림
    setTimeout(() => {
      this.handleNotification({
        type: 'new_message',
        senderName: '김개발',
        chatId: 'chat_123'
      });
    }, 8000);

    // 12초 후 시스템 업데이트 알림
    setTimeout(() => {
      this.handleNotification({
        type: 'system_update',
        message: '새로운 화상통화 기능이 추가되었습니다!'
      });
    }, 12000);
  }

  // 시간 계산 헬퍼 함수
  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return '';
    
    try {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const diffMs = end - start;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins >= 60) {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
      }
      return `${diffMins}분`;
    } catch (error) {
      return '';
    }
  }

  // HH:MM 형태의 시간으로 지속시간 계산
  calculateDurationFromTimes(startTime, endTime) {
    if (!startTime || !endTime) return '';
    
    try {
      // HH:MM 형태를 파싱
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const diffMins = endMinutes - startMinutes;
      
      if (diffMins >= 60) {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
      }
      return `${diffMins}분`;
    } catch (error) {
      console.error('시간 계산 오류:', error);
      return '';
    }
  }
}

// 싱글톤 인스턴스 생성
const notificationService = new NotificationService();

// 글로벌 함수 등록 (다른 곳에서 사용할 수 있도록)
window.showChatRoomCreatedNotification = (chatRoomId, reservationId = null) => {
  return notificationService.showChatRoomCreatedNotification(chatRoomId, reservationId);
};

window.showChatTerminationNotification = (content, endTime = null) => {
  notificationService.handleChatTerminationNotification({
    content: content,
    endTime: endTime,
    createdAt: new Date().toISOString()
  });
};

  // 🚨 디버깅용 테스트 함수들 (개발 환경에서만 사용)
if (import.meta.env.MODE === 'development') {
  window.testChatRoomNotification = (reservationId = null) => {
    console.log('🧪 채팅방 생성 알림 테스트 시작');
    // 예약 ID가 제공되지 않으면 랜덤하게 생성
    const testReservationId = reservationId || Math.floor(Math.random() * 1000) + 1;
    const testChatRoomId = `test_chat_${Date.now()}`;
    
    console.log(`📋 테스트 예약 ID: ${testReservationId}, 채팅방 ID: ${testChatRoomId}`);
    notificationService.showChatRoomCreatedNotification(testChatRoomId, testReservationId);
  };

  window.testSSEConnection = () => {
    console.log('🔌 SSE 연결 상태:', notificationService.isServiceConnected());
    console.log('🔌 SSE ReadyState:', sseService.getReadyState());
    console.log('🔌 EventSource States: CONNECTING=0, OPEN=1, CLOSED=2');
  };

  window.testChatOpenEvent = (chatRoomId = null, reservationId = null) => {
    console.log('🧪 chat-open 이벤트 시뮬레이션');
    // 파라미터가 제공되지 않으면 랜덤하게 생성
    const testChatRoomId = chatRoomId || `test_chat_${Date.now()}`;
    const testReservationId = reservationId || Math.floor(Math.random() * 1000) + 1;
    
    console.log(`📋 테스트 채팅방 ID: ${testChatRoomId}, 예약 ID: ${testReservationId}`);
    notificationService.handleChatStartNotification({
      chatRoomId: testChatRoomId,
      reservationId: testReservationId
    });
  };

  // 실제 백엔드 SSE 이벤트 구조 확인용
  window.debugSSEEvent = (eventData) => {
    console.group('🔍 SSE 이벤트 구조 분석');
    console.log('이벤트 원본 데이터:', eventData);
    console.log('데이터 타입:', typeof eventData);
    if (typeof eventData === 'object') {
      console.log('객체 키들:', Object.keys(eventData));
      console.log('각 필드별 값과 타입:');
      Object.entries(eventData).forEach(([key, value]) => {
        console.log(`  ${key}:`, value, `(${typeof value})`);
      });
    }
    console.groupEnd();
    
    // 실제 핸들러로 전달
    notificationService.handleChatStartNotification(eventData);
  };

  // API 직접 테스트 함수 (개선된 버전)
  window.testReservationAPI = async (reservationId) => {
    if (!reservationId) {
      console.log('사용법: window.testReservationAPI(123)');
      return;
    }
    
    console.log('🧪 예약 API 직접 테스트:', reservationId);
    console.log('🔥 완전한 알림 생성 프로세스 테스트');
    
    // 실제 알림 생성 프로세스 실행
    await notificationService.showChatRoomCreatedNotification(`test_chat_${Date.now()}`, reservationId);
  };

  // 멘토와 티켓 API 개별 테스트 함수
  window.testMentorAPI = async (mentorId) => {
    if (!mentorId) {
      console.log('사용법: window.testMentorAPI(12)');
      return;
    }
    
    console.log('🧪 멘토 API 테스트:', mentorId);
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const accessToken = accessTokenUtils.getAccessToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (accessToken) {
        headers.Authorization = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
      }
      
      // 가능한 여러 엔드포인트 시도
      const possibleEndpoints = [
        `/api/mentors/${mentorId}`,
        `/api/mentor/${mentorId}`,
        `/api/users/${mentorId}`,
        `/api/profiles/${mentorId}`
      ];
      
      for (const endpoint of possibleEndpoints) {
        const apiUrl = `${baseUrl}${endpoint}`;
        console.log('🌐 시도 중인 멘토 API URL:', apiUrl);
        
        try {
          const response = await fetch(apiUrl, { headers });
          const responseText = await response.text();
          
          console.log(`🌐 ${endpoint} 응답 상태:`, response.status);
          console.log(`🌐 ${endpoint} 응답 본문:`, responseText);
          
          if (response.ok) {
            try {
              const data = JSON.parse(responseText);
              console.log(`✅ ${endpoint} 성공! 파싱된 데이터:`, data);
              return data;
            } catch (e) {
              console.error(`❌ ${endpoint} JSON 파싱 실패:`, e);
            }
          }
        } catch (error) {
          console.error(`❌ ${endpoint} 네트워크 오류:`, error);
        }
      }
      
      console.log('❌ 모든 멘토 API 엔드포인트 시도 실패');
    } catch (error) {
      console.error('❌ 멘토 API 테스트 실패:', error);
    }
  };

  window.testTicketAPI = async (ticketId) => {
    if (!ticketId) {
      console.log('사용법: window.testTicketAPI(1)');
      return;
    }
    
    console.log('🧪 티켓 API 테스트:', ticketId);
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const accessToken = accessTokenUtils.getAccessToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (accessToken) {
        headers.Authorization = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
      }
      
      // 가능한 여러 엔드포인트 시도
      const possibleEndpoints = [
        `/api/tickets/${ticketId}`,
        `/api/ticket/${ticketId}`,
        `/api/services/${ticketId}`,
        `/api/packages/${ticketId}`,
        `/api/products/${ticketId}`
      ];
      
      for (const endpoint of possibleEndpoints) {
        const apiUrl = `${baseUrl}${endpoint}`;
        console.log('🌐 시도 중인 티켓 API URL:', apiUrl);
        
        try {
          const response = await fetch(apiUrl, { headers });
          const responseText = await response.text();
          
          console.log(`🌐 ${endpoint} 응답 상태:`, response.status);
          console.log(`🌐 ${endpoint} 응답 본문:`, responseText);
          
          if (response.ok) {
            try {
              const data = JSON.parse(responseText);
              console.log(`✅ ${endpoint} 성공! 파싱된 데이터:`, data);
              return data;
            } catch (e) {
              console.error(`❌ ${endpoint} JSON 파싱 실패:`, e);
            }
          }
        } catch (error) {
          console.error(`❌ ${endpoint} 네트워크 오류:`, error);
        }
      }
      
      console.log('❌ 모든 티켓 API 엔드포인트 시도 실패');
    } catch (error) {
      console.error('❌ 티켓 API 테스트 실패:', error);
    }
  };

  // 채팅 종료 토스트 직접 테스트 함수 (5분 전 알림만)
  window.testTerminationToast = (message = null, endTime = null) => {
    console.log('🧪 채팅 종료 토스트 테스트 시작 (5분 전 알림)');
    
    const testMessage = message || '멘토링 세션이 5분 후 종료됩니다. 마무리 준비를 해주세요.';
    const testEndTime = endTime || new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5분 후 종료
    
    console.log('📋 테스트 종료 메시지:', testMessage);
    console.log('📋 테스트 종료 시간:', testEndTime);
    console.log('🕒 현재 시간:', new Date().toISOString());
    console.log('⏰ 실제 시나리오: 세션 종료 5분 전 알림');
    
    notificationService.handleChatTerminationNotification({
      content: testMessage,
      endTime: testEndTime,
      createdAt: new Date().toISOString()
    });
  };

  // SSE 종료 이벤트 시뮬레이션 함수 (5분 전 알림)
  window.testSSETerminationEvent = (chatRoomId = null, message = null) => {
    console.log('🧪 SSE 채팅 종료 이벤트 시뮬레이션 (5분 전 알림)');
    
    const testChatRoomId = chatRoomId || `chat_${Date.now()}`;
    const testMessage = message || '멘토링 세션이 5분 후 종료됩니다. 마무리 준비를 해주세요.';
    
    console.log('📋 테스트 채팅방 ID:', testChatRoomId);
    console.log('📋 테스트 메시지:', testMessage);
    
    // 실제 SSE 이벤트 구조로 시뮬레이션 (5분 후 종료)
    const mockEvent = {
      eventType: 'chat-termination',
      data: JSON.stringify({
        chatRoomId: testChatRoomId,
        content: testMessage,
        endTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5분 후 종료
        createdAt: new Date().toISOString()
      }),
      parsedData: {
        chatRoomId: testChatRoomId,
        content: testMessage,
        endTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
    };
    
    // SSE 메시지 핸들러로 전달
    notificationService.handleMessage(mockEvent);
  };

  // 멘티 정보 직접 테스트 함수
  window.testMenteeAPI = async (menteeId) => {
    if (!menteeId) {
      console.log('사용법: window.testMenteeAPI(37)');
      return;
    }
    
    console.log('🧪 멘티 API 테스트:', menteeId);
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const accessToken = accessTokenUtils.getAccessToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (accessToken) {
        headers.Authorization = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
      }
      
      const apiUrl = `${baseUrl}/api/users/${menteeId}`;
      console.log('🌐 멘티 API URL:', apiUrl);
      console.log('🌐 헤더:', headers);
      
      const response = await fetch(apiUrl, { headers });
      const responseText = await response.text();
      
      console.log('🌐 응답 상태:', response.status);
      console.log('🌐 응답 본문:', responseText);
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log('✅ 멘티 데이터 파싱 성공:', data);
          console.log('🔍 멘티 이름:', data.data?.name);
          console.log('🔍 멘티 역할:', data.data?.userRole);
          return data;
        } catch (e) {
          console.error('❌ JSON 파싱 실패:', e);
        }
      } else {
        console.error('❌ 멘티 API 호출 실패');
      }
    } catch (error) {
      console.error('❌ 멘티 API 테스트 실패:', error);
    }
  };

  // 사용법 안내
  console.log(`
🧪 알림 테스트 함수 사용법:

📢 기본 알림 테스트:
- window.testChatRoomNotification() // 랜덤 예약 ID로 테스트
- window.testChatRoomNotification(123) // 특정 예약 ID로 테스트
- window.testChatOpenEvent() // 랜덤 ID들로 테스트  
- window.testChatOpenEvent('chat_456', 789) // 특정 ID들로 테스트

🔌 연결 및 이벤트 테스트:
- window.testSSEConnection() // SSE 연결 상태 확인
- window.debugSSEEvent({chatRoomId: 'room123', reservationId: 456}) // SSE 이벤트 구조 분석

📊 API 직접 테스트:
- window.testReservationAPI(120) // 완전한 알림 생성 프로세스 테스트
- window.testMentorAPI(12) // 멘토 API 테스트
- window.testTicketAPI(1) // 티켓 API 테스트
- window.testMenteeAPI(37) // 멘티 API 직접 테스트

🚨 종료 알림 테스트 (5분 전 알림만):
- window.testTerminationToast() // 기본: 5분 후 종료 예정 알림
- window.testTerminationToast('커스텀 메시지') // 커스텀 메시지로 5분 전 종료 알림
- window.testSSETerminationEvent() // SSE 종료 이벤트 시뮬레이션 (5분 전)
- window.testSSETerminationEvent('chat_123', '멘토님이 종료를 요청했습니다') // 커스텀 SSE 종료 이벤트
  `);
}

export default notificationService;