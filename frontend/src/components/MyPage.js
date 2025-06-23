import React, {useState, useEffect} from 'react';
import {
  User,
  Settings,
  BookOpen,
  CreditCard,
  FileText,
  Briefcase,
  Clock,
  LogOut,
  ArrowLeft,
  Edit3,
  Check,
  X,
  Eye,
  EyeOff,
  Key,
  UserX,
  UserPlus,
  AlertTriangle,
  MessageSquare,
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import './MyPage.css';
import {userInfoUtils, authUtils, refreshTokenUtils} from '../utils/tokenUtils';
import {
  userAPI,
  authAPI,
  reservationAPI,
  ticketAPI,
  paymentAPI,
  inquiryAPI,
  careerAPI,
  profileAPI
} from '../services/api';

const MyPage = ({onBack, onLogout}) => {
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [tempBankInfo, setTempBankInfo] = useState(
      {bank: '', accountNumber: ''});
  const [isUpdating, setIsUpdating] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [careers, setCareers] = useState([]);
  const [profiles, setProfiles] = useState([]);

  // 각 탭별 로딩 상태 관리
  const [tabLoadingStates, setTabLoadingStates] = useState({
    reservations: false,
    payments: false,
    complaints: false,
    careers: false,
    mentorProfile: false
  });

  // 각 탭별 데이터 로딩 여부 추적
  const [tabDataLoaded, setTabDataLoaded] = useState({
    reservations: false,
    payments: false,
    complaints: false,
    careers: false,
    mentorProfile: false
  });

  // 비밀번호 변경 모달 관련 state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    delete: false
  });
  const [modalLoading, setModalLoading] = useState(false);

  // 회원탈퇴 모달 관련 state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // 한국 주요 은행 목록
  const banks = [
    '국민은행', '신한은행', '우리은행', '하나은행', 'KEB하나은행',
    '농협은행', '기업은행', '신협', '우체국은행', '카카오뱅크',
    '케이뱅크', '토스뱅크', '새마을금고', '산업은행', '수협은행',
    '경남은행', '광주은행', '대구은행', '부산은행', '전북은행',
    '제주은행', 'SC제일은행', '한국씨티은행', 'HSBC은행'
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // userInfo가 로딩되고 멘토라면 프로필도 미리 로딩
  useEffect(() => {
    if (userInfo && userInfo.userRole === 'MENTOR') {
      console.log('🎯 멘토 확인됨, 프로필 미리 로딩');
      fetchMentorProfile();
    }
  }, [userInfo]);

  // 예약 내역 불러오기 함수
  const fetchReservations = async () => {
    if (tabDataLoaded.reservations) {
      return;
    } // 이미 로딩했으면 재호출하지 않음

    setTabLoadingStates(prev => ({...prev, reservations: true}));
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
          id => userAPI.getUserById(id));
      const menteePromises = Array.from(uniqueMenteeIds).map(
          id => userAPI.getUserById(id));
      const ticketPromises = Array.from(uniqueTicketIds).map(
          id => ticketAPI.getTicket(id));

      const [mentorResponses, menteeResponses, ticketResponses] = await Promise.all(
          [
            Promise.all(mentorPromises),
            Promise.all(menteePromises),
            Promise.all(ticketPromises)
          ]);

      // 3. ID를 키로 하는 Map을 생성하여 빠른 조회를 가능하게 함
      const mentorMap = new Map(
          mentorResponses.map(res => [res.data.data.id, res.data.data.name]));
      const menteeMap = new Map(
          menteeResponses.map(res => [res.data.data.id, res.data.data.name]));
      const ticketMap = new Map(ticketResponses.map(res => [
        res.data.data.id,
        {
          name: res.data.data.name,
          price: res.data.data.price,
          time: res.data.data.ticketTime
        }
      ]));

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
      setTabDataLoaded(prev => ({...prev, reservations: true}));
    } catch (err) {
      console.error("예약 내역을 불러오는 데 실패했습니다:", err);
      setError("예약 내역을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setTabLoadingStates(prev => ({...prev, reservations: false}));
    }
  };

  // 결제 내역 불러오기 함수
  const fetchPayments = async () => {
    if (userInfo?.userRole !== 'MENTEE' || tabDataLoaded.payments) {
      return;
    }

    setTabLoadingStates(prev => ({...prev, payments: true}));
    setError(null);

    try {
      const response = await paymentAPI.getPaymentHistory();
      const fetchedPayments = response.data.data.content;
      setPayments(fetchedPayments);
      setTabDataLoaded(prev => ({...prev, payments: true}));
    } catch (err) {
      console.error("결제 내역을 불러오는 데 실패했습니다:", err);
      setError("결제 내역을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setTabLoadingStates(prev => ({...prev, payments: false}));
    }
  };

  // 민원 내역 불러오기 함수
  const fetchComplaints = async () => {
    if (!userInfo || tabDataLoaded.complaints) {
      return;
    }

    setTabLoadingStates(prev => ({...prev, complaints: true}));
    setError(null);

    try {
      const response = await inquiryAPI.getUserInquiries();
      const rawComplaints = response.data.data.content;
      setComplaints(rawComplaints);
      setTabDataLoaded(prev => ({...prev, complaints: true}));
    } catch (err) {
      console.error("민원 내역을 불러오는 데 실패했습니다:", err);
      setError("민원 내역을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setTabLoadingStates(prev => ({...prev, complaints: false}));
    }
  };

  // 경력 내역 불러오기 함수
  const fetchCareers = async () => {
    if (userInfo?.userRole !== 'MENTOR' || tabDataLoaded.careers) {
      return;
    }

    setTabLoadingStates(prev => ({...prev, careers: true}));
    setError(null);

    try {
      const response = await careerAPI.getAllCareers();
      const rawCareers = response.data.data.content;
      setCareers(rawCareers);
      setTabDataLoaded(prev => ({...prev, careers: true}));
    } catch (err) {
      setError("경력 내역을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setTabLoadingStates(prev => ({...prev, careers: false}));
    }
  };

  // 멘토 프로필 불러오기
  const fetchMentorProfile = async () => {
    if (userInfo?.userRole !== 'MENTOR') {
      console.log('❌ 멘토가 아님:', userInfo?.userRole);
      return;
    }
    
    if (tabDataLoaded.mentorProfile) {
      console.log('✅ 이미 로딩됨, 재호출 안함');
      return;
    }
    
    console.log('🔍 멘토 프로필 로딩 시작...');
    setTabLoadingStates(prev => ({...prev, mentorProfile: true}));
    setError(null);
    
    try {
      const response = await profileAPI.getMyProfile()
      console.log('📥 API 응답:', response);
      const rawProfiles = response.data.data.content;
      console.log('📋 프로필 데이터:', rawProfiles);

      setProfiles(rawProfiles || []);
      setTabDataLoaded(prev => ({...prev, mentorProfile: true}));
      console.log('✅ 프로필 설정 완료:', rawProfiles?.length || 0, '개');

    } catch (err) {
      console.error('❌ 프로필 로딩 실패:', err);
      setError("프로필 내역을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setProfiles([]);
    } finally {
      setTabLoadingStates(prev => ({...prev, mentorProfile: false}));
    }
  }

  // 탭 변경 시 해당 데이터 불러오기
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);

    // 탭별로 필요한 데이터 불러오기
    switch (tabName) {
      case 'bookings':
        fetchReservations();
        break;
      case 'payments':
        fetchPayments();
        break;
      case 'inquiries':
        fetchComplaints();
        break;
      case 'careers':
        fetchCareers();
        break;
      case 'mentorRegister':
        fetchMentorProfile();
        break
      default:
        break;
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      setError("로그인이 필요합니다. 다시 로그인해주세요.");
      authUtils.clearAllAuthData();
      onLogout();
      setLoading(false);
      return;
    }

    try {
      const response = await userAPI.getUser();

      if (response.data && response.data.data) {
        const backendUserData = response.data.data;

        const mappedUserInfo = {
          id: backendUserData.id,
          name: backendUserData.name,
          email: backendUserData.email,
          nickName: backendUserData.nickName,
          phoneNumber: backendUserData.phoneNumber,
          userRole: backendUserData.userRole,
          createdAt: backendUserData.createdAt,
          profileImage: backendUserData.profileImage || '/default-profile.svg',
          bank: backendUserData.bank || '',
          accountNumber: backendUserData.accountNumber || ''
        };

        setUserInfo(mappedUserInfo);
        userInfoUtils.setUserInfo(mappedUserInfo);

      } else {
        setError("사용자 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("인증이 만료되었습니다. 다시 로그인해주세요.");
        authUtils.clearAllAuthData();
        onLogout();
      } else if (error.response?.status === 404) {
        setError("사용자 정보를 찾을 수 없습니다.");
      } else if (error.code === 'ERR_NETWORK') {
        setError("서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
      } else {
        setError("마이페이지를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false); // 반드시 로딩 상태를 해제
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // 백엔드 호출 실패해도 클라이언트 로그아웃은 진행
    } finally {
      authUtils.clearAllAuthData();
      onLogout();
    }
  };

  // 필드 편집 관련 함수들
  const handleEditField = (field) => {
    setEditingField(field);
    if (field === 'bankInfo') {
      setTempBankInfo({
        bank: userInfo.bank || '',
        accountNumber: userInfo.accountNumber || ''
      });
    } else {
      setTempValue(userInfo[field] || '');
    }
  };

  const handleSaveField = async (field) => {
    try {
      setIsUpdating(true);

      let updateData = {};
      let updatedUserInfo;

      if (field === 'bankInfo') {
        updateData = {
          bank: tempBankInfo.bank,
          accountNumber: tempBankInfo.accountNumber
        };
        updatedUserInfo = {
          ...userInfo,
          bank: tempBankInfo.bank,
          accountNumber: tempBankInfo.accountNumber
        };
      } else {
        updateData = {[field]: tempValue};
        updatedUserInfo = {...userInfo, [field]: tempValue};
      }

      console.log('📤 API 호출 - 업데이트 데이터:', updateData);

      // 실제 API 호출
      const response = await userAPI.updateUser(updateData);
      console.log('📥 API 응답:', response);

      // 성공 시 상태 업데이트
      setUserInfo(updatedUserInfo);
      userInfoUtils.setUserInfo(updatedUserInfo);

      setEditingField(null);
      setTempValue('');
      setTempBankInfo({bank: '', accountNumber: ''});

      alert('정보가 성공적으로 업데이트되었습니다.');

    } catch (error) {
      console.error('❌ API 호출 실패:', error);
      console.error('- 상태:', error.response?.status);
      console.error('- 메시지:', error.response?.data);

      if (error.response?.status === 401) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        authUtils.clearAllAuthData();
        onLogout();
      } else if (error.response?.status === 403) {
        alert('접근 권한이 없습니다. 토큰을 확인해주세요.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || '입력 정보를 확인해주세요.';
        alert(`입력 오류: ${errorMessage}`);
      } else if (error.code === 'ERR_NETWORK') {
        alert('서버에 연결할 수 없습니다. 백엔드 서버 상태를 확인해주세요.');
      } else {
        alert('업데이트 중 오류가 발생했습니다.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue('');
    setTempBankInfo({bank: '', accountNumber: ''});
  };

  // 비밀번호 변경 모달 관련 함수들
  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordData({
      currentPassword: '',
      newPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      delete: false
    });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      delete: false
    });
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword.length < 8) {
      alert('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    try {
      setModalLoading(true);

      const updateData = {
        rawPassword: passwordData.currentPassword,  // 현재 비밀번호 -> rawPassword
        newPassword: passwordData.newPassword       // 새 비밀번호 -> newPassword
      };

      await userAPI.updatePassword(updateData);

      alert('비밀번호가 성공적으로 변경되었습니다.');
      closePasswordModal();

    } catch (error) {
      console.error('비밀번호 변경 실패:', error);

      if (error.response?.status === 401) {
        alert('현재 비밀번호가 올바르지 않습니다.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message
            || '비밀번호 형식을 확인해주세요.';
        alert(`오류: ${errorMessage}`);
      } else {
        alert('비밀번호 변경 중 오류가 발생했습니다.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  // 회원탈퇴 모달 관련 함수들
  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
    setShowPasswords({
      current: false,
      new: false,
      delete: false
    });
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setShowPasswords({
      current: false,
      new: false,
      delete: false
    });
  };

  const handleAccountDelete = async () => {
    if (!deletePassword.trim()) {
      alert('현재 비밀번호를 입력해주세요.');
      return;
    }

    const confirmDelete = window.confirm(
        '정말로 회원탈퇴를 하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setModalLoading(true);

      const refreshToken = refreshTokenUtils.getRefreshToken();
      const deleteData = {
        password: deletePassword,
        refreshToken: refreshToken
      };

      await userAPI.deleteUser(deleteData);

      // 회원탈퇴 성공 시에만 토큰 삭제 및 로그아웃 처리
      alert('회원탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
      authUtils.clearAllAuthData();
      onLogout();

    } catch (error) {
      console.error('회원탈퇴 실패:', error);

      if (error.response?.status === 401) {
        alert('비밀번호가 올바르지 않습니다.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message
            || '회원탈퇴 요청을 처리할 수 없습니다.';
        alert(`오류: ${errorMessage}`);
      } else {
        alert('회원탈퇴 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  // 멘토 프로필 페이지로 이동
  const handleViewMentorProfile = (profileId) => {
    console.log('🔗 멘토 프로필 페이지로 이동:', profileId);
    // MentorProfile.js 페이지로 이동 (profileId를 파라미터로 전달)
    // React Router를 사용한다면: navigate(`/mentor-profile/${profileId}`);
    // 현재는 window.location을 사용
    window.location.href = `/mentor-profile?profileId=${profileId}`;
  };
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading && !userInfo) {
    return (
        <div className="mypage-container">
          <div className="mypage-loading">
            <p>사용자 정보를 불러오는 중입니다...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="mypage-container">
          <div className="mypage-loading error">
            <p>{error}</p>
            <div className="error-actions">
              <button className="back-button" onClick={onBack}>뒤로 가기</button>
            </div>
          </div>
        </div>
    );
  }

  if (!userInfo) {
    return (
        <div className="mypage-container">
          <div className="mypage-loading">
            <p>사용자 정보를 찾을 수 없습니다.</p>
            <button className="back-button" onClick={onBack}>뒤로 가기</button>
          </div>
        </div>
    );
  }

  return (
      <div className="mypage-container">
        <div className="mypage-header">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft className="icon"/>
          </button>
          <h1>마이페이지</h1>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut className="icon"/>
            로그아웃
          </button>
        </div>

        <div className="mypage-content">
          <div className="profile-section">
            <div className="profile-image-container">
              <img
                  src={userInfo.profileImage || '/default-profile.svg'}
                  alt="프로필"
                  className="profile-image"
              />
              <button className="profile-edit-button">
                <Settings className="icon"/>
              </button>
            </div>
            <div className="profile-info">
              <h2>{userInfo.name}</h2>
              <p>{userInfo.email}</p>
              <span className="user-level">
              {userInfo.userRole === 'MENTOR' ? '멘토' : '멘티'}
            </span>
            </div>
          </div>

          <div className="mypage-main">
            {/* 왼쪽 사이드바 */}
            <div className="sidebar">
              <div className="sidebar-header">
                <h3>메뉴</h3>
              </div>
              <nav className="sidebar-nav">
                <button
                    className={`sidebar-item ${activeTab === 'profile'
                        ? 'active' : ''}`}
                    onClick={() => handleTabChange('profile')}
                >
                  <User className="sidebar-icon"/>
                  <span>프로필</span>
                </button>

                <button
                    className={`sidebar-item ${activeTab === 'bookings'
                        ? 'active' : ''}`}
                    onClick={() => handleTabChange('bookings')}
                >
                  <BookOpen className="sidebar-icon"/>
                  <span>{userInfo.userRole === 'MENTOR' ? '예정된 예약'
                      : '예약 내역'}</span>
                </button>

                {/* 멘티만 결제 내역 표시 */}
                {userInfo.userRole === 'MENTEE' && (
                    <button
                        className={`sidebar-item ${activeTab === 'payments'
                            ? 'active' : ''}`}
                        onClick={() => handleTabChange('payments')}
                    >
                      <CreditCard className="sidebar-icon"/>
                      <span>결제 내역</span>
                    </button>
                )}

                <button
                    className={`sidebar-item ${activeTab === 'inquiries'
                        ? 'active' : ''}`}
                    onClick={() => handleTabChange('inquiries')}
                >
                  <FileText className="sidebar-icon"/>
                  <span>민원 내역</span>
                </button>

                {/* 멘토 전용 메뉴 */}
                {userInfo.userRole === 'MENTOR' && (
                    <>
                      <div className="sidebar-divider"></div>
                      <div className="sidebar-section-title">멘토 전용</div>

                      <button
                          className={`sidebar-item ${activeTab
                          === 'mentorRegister'
                              ? 'active' : ''}`}
                          onClick={() => handleTabChange('mentorRegister')}
                      >
                        <UserPlus className="sidebar-icon"/>
                        <span>멘토 등록</span>
                      </button>

                      <button
                          className={`sidebar-item ${activeTab === 'careers'
                              ? 'active' : ''}`}
                          onClick={() => handleTabChange('careers')}
                      >
                        <Briefcase className="sidebar-icon"/>
                        <span>경력 목록</span>
                      </button>

                      <button
                          className={`sidebar-item ${activeTab === 'schedule'
                              ? 'active' : ''}`}
                          onClick={() => handleTabChange('schedule')}
                      >
                        <Clock className="sidebar-icon"/>
                        <span>상담 가능 시간</span>
                      </button>
                    </>
                )}
              </nav>
            </div>

            {/* 오른쪽 컨텐츠 영역 */}
            <div className="content-area">
              {activeTab === 'profile' && (
                  <div className="profile-tab">
                    <div className="info-card">
                      <div className="info-card-header">
                        <h3>✨ 기본 정보</h3>
                      </div>
                      <div className="info-card-body">
                        {/* 이름 - 읽기 전용 */}
                        <div className="info-item">
                          <label>👤 이름</label>
                          <span>{userInfo.name}</span>
                        </div>

                        {/* 닉네임 - 편집 가능 */}
                        <div className="info-item editable">
                          <label>🏷️ 닉네임</label>
                          {editingField === 'nickName' ? (
                              <div className="edit-field">
                                <input
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(
                                        e.target.value)}
                                    className="edit-input"
                                    autoFocus
                                    placeholder="닉네임을 입력하세요"
                                />
                                <div className="edit-buttons">
                                  <button
                                      className="save-btn"
                                      onClick={() => handleSaveField(
                                          'nickName')}
                                      disabled={isUpdating}
                                  >
                                    {isUpdating && editingField === 'nickName'
                                        ? (
                                            <div
                                                className="spinner-small"></div>
                                        ) : (
                                            <Check size={16}/>
                                        )}
                                  </button>
                                  <button
                                      className="cancel-btn"
                                      onClick={handleCancelEdit}
                                      disabled={isUpdating}
                                  >
                                    <X size={16}/>
                                  </button>
                                </div>
                              </div>
                          ) : (
                              <div className="field-display">
                                <span>{userInfo.nickName}</span>
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEditField('nickName')}
                                >
                                  <Edit3 size={16}/>
                                </button>
                              </div>
                          )}
                        </div>

                        {/* 이메일 - 읽기 전용 */}
                        <div className="info-item">
                          <label>📧 이메일</label>
                          <span>{userInfo.email}</span>
                        </div>

                        {/* 전화번호 - 편집 가능 */}
                        <div className="info-item editable">
                          <label>📱 전화번호</label>
                          {editingField === 'phoneNumber' ? (
                              <div className="edit-field">
                                <input
                                    type="tel"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(
                                        e.target.value)}
                                    className="edit-input"
                                    autoFocus
                                    placeholder="전화번호를 입력하세요"
                                />
                                <div className="edit-buttons">
                                  <button
                                      className="save-btn"
                                      onClick={() => handleSaveField(
                                          'phoneNumber')}
                                      disabled={isUpdating}
                                  >
                                    {isUpdating && editingField
                                    === 'phoneNumber' ? (
                                        <div className="spinner-small"></div>
                                    ) : (
                                        <Check size={16}/>
                                    )}
                                  </button>
                                  <button
                                      className="cancel-btn"
                                      onClick={handleCancelEdit}
                                      disabled={isUpdating}
                                  >
                                    <X size={16}/>
                                  </button>
                                </div>
                              </div>
                          ) : (
                              <div className="field-display">
                                <span>{userInfo.phoneNumber}</span>
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEditField(
                                        'phoneNumber')}
                                >
                                  <Edit3 size={16}/>
                                </button>
                              </div>
                          )}
                        </div>

                        {/* 멘토인 경우에만 은행 정보 표시 */}
                        {userInfo.userRole === 'MENTOR' && (
                            <div className="info-item editable">
                              <label>🏦 은행 정보</label>
                              {editingField === 'bankInfo' ? (
                                  <div className="edit-field bank-edit">
                                    <select
                                        value={tempBankInfo.bank}
                                        onChange={(e) => setTempBankInfo({
                                          ...tempBankInfo,
                                          bank: e.target.value
                                        })}
                                        className="bank-select"
                                    >
                                      <option value="">🏦 은행을 선택하세요</option>
                                      {banks.map((bank) => (
                                          <option key={bank}
                                                  value={bank}>{bank}</option>
                                      ))}
                                    </select>
                                    <input
                                        type="text"
                                        value={tempBankInfo.accountNumber}
                                        onChange={(e) => setTempBankInfo({
                                          ...tempBankInfo,
                                          accountNumber: e.target.value
                                        })}
                                        className="edit-input"
                                        placeholder="💳 계좌번호를 입력하세요"
                                    />
                                    <div className="edit-buttons">
                                      <button
                                          className="save-btn"
                                          onClick={() => handleSaveField(
                                              'bankInfo')}
                                          disabled={isUpdating}
                                      >
                                        {isUpdating && editingField
                                        === 'bankInfo' ? (
                                            <div
                                                className="spinner-small"></div>
                                        ) : (
                                            <Check size={16}/>
                                        )}
                                      </button>
                                      <button
                                          className="cancel-btn"
                                          onClick={handleCancelEdit}
                                          disabled={isUpdating}
                                      >
                                        <X size={16}/>
                                      </button>
                                    </div>
                                  </div>
                              ) : (
                                  <div className="field-display">
                                    <span>
                                      {userInfo.bank && userInfo.accountNumber
                                          ? `${userInfo.bank} ${userInfo.accountNumber}`
                                          : '은행 정보가 등록되지 않았습니다'
                                      }
                                    </span>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditField(
                                            'bankInfo')}
                                    >
                                      <Edit3 size={16}/>
                                    </button>
                                  </div>
                              )}
                            </div>
                        )}

                        {/* 읽기 전용 필드들 */}
                        <div className="info-item">
                          <label>📅 가입일</label>
                          <span>{userInfo.createdAt}</span>
                        </div>
                        <div className="info-item">
                          <label>🎯 사용자 유형</label>
                          <span>{userInfo.userRole === 'MENTOR' ? '🎓 멘토'
                              : '👨‍🎓 멘티'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 계정 관리 버튼들 */}
                    <div className="account-actions">
                      <button
                          className="password-change-btn"
                          onClick={openPasswordModal}
                      >
                        <Key className="icon"/>
                        🔐 비밀번호 수정
                      </button>

                      <button
                          className="account-delete-btn"
                          onClick={openDeleteModal}
                      >
                        <UserX className="icon"/>
                        ❌ 회원탈퇴
                      </button>
                    </div>
                  </div>
              )}

              {activeTab === 'bookings' && (
                  <div className="bookings-tab">
                    <div className="section-header">
                      <h3>{userInfo.userRole === 'MENTOR' ? '예정된 예약'
                          : '예약 내역'}</h3>
                      <p>{userInfo.userRole === 'MENTOR'
                          ? '예정된 멘토링 세션을 확인하고 관리하세요'
                          : '멘토링 예약 및 이용 내역을 확인하세요'}</p>
                    </div>

                    {reservations.length > 0 ? (
                        <div className="reservations-scroll-container">
                          <div className="reservations-container">
                            {reservations.map((reservation) => (
                                <div key={reservation.id}
                                     className="reservation-card">
                                  <div className="reservation-header">
                                    <div className="reservation-title">
                                      <h4>{reservation.ticketName}</h4>
                                      <span
                                          className={`status-badge ${reservation.status.toLowerCase()}`}>
                                        {reservation.status === 'CONFIRMED'
                                            ? '확정' :
                                            reservation.status === 'PENDING'
                                                ? '대기중' :
                                                reservation.status
                                                === 'COMPLETED' ? '완료' :
                                                    reservation.status
                                                    === 'CANCELLED' ? '취소됨'
                                                        : reservation.status}
                                      </span>
                                    </div>
                                    <div className="reservation-price">
                                      ₩{reservation.ticketPrice.toLocaleString()}
                                    </div>
                                  </div>

                                  <div className="reservation-body">
                                    <div className="reservation-info">
                                      <div className="info-row">
                                        <span
                                            className="info-label">{userInfo.userRole
                                        === 'MENTOR' ? '멘티' : '멘토'}</span>
                                        <span
                                            className="info-value">{userInfo.userRole
                                        === 'MENTOR' ? reservation.mentee
                                            : reservation.mentor}</span>
                                      </div>
                                      <div className="info-row">
                                        <span
                                            className="info-label">이용 시간</span>
                                        <span
                                            className="info-value">{reservation.ticketTime}분</span>
                                      </div>
                                    </div>

                                    <div className="reservation-schedule">
                                      <div className="schedule-item">
                                        <Clock className="schedule-icon"/>
                                        <div className="schedule-details">
                                          <div className="schedule-date">
                                            {new Date(
                                                reservation.startTime).toLocaleDateString(
                                                'ko-KR', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                                  weekday: 'short'
                                                })}
                                          </div>
                                          <div className="schedule-time">
                                            {new Date(
                                                reservation.startTime).toLocaleTimeString(
                                                'ko-KR', {
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                })} ~ {new Date(
                                              reservation.endTime).toLocaleTimeString(
                                              'ko-KR', {
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
                                          <BookOpen size={16}/>
                                          상담 시작
                                        </button>
                                    )}
                                    {reservation.status === 'COMPLETED' && (
                                        <button
                                            className="action-btn secondary">
                                          <FileText size={16}/>
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
                          <BookOpen className="empty-icon"/>
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
                          {userInfo.userRole === 'MENTEE' && (
                              <button className="empty-action-btn">
                                멘토 찾아보기
                              </button>
                          )}
                        </div>
                    )}
                  </div>
              )}

              {/* 멘티만 결제 내역 탭 표시 */}
              {activeTab === 'payments' && userInfo.userRole === 'MENTEE' && (
                  <div className="payments-tab">
                    <div className="section-header">
                      <h3>결제 내역</h3>
                      <p>멘토링 결제 및 환불 내역을 확인하세요</p>
                    </div>

                    {tabLoadingStates.payments ? (
                        <div className="loading-state">
                          <div className="loading-spinner"></div>
                          <p>결제 내역을 불러오는 중...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                          <CreditCard className="error-icon"/>
                          <h4>오류가 발생했습니다</h4>
                          <p>{error}</p>
                          <button className="retry-btn" onClick={() => {
                            setTabDataLoaded(
                                prev => ({...prev, payments: false}));
                            setError(null);
                            fetchPayments();
                          }}>
                            다시 시도
                          </button>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="empty-state">
                          <CreditCard className="empty-icon"/>
                          <h4>아직 결제 내역이 없습니다</h4>
                          <p>멘토링을 예약하고 결제해보세요!</p>
                        </div>
                    ) : (
                        <div className="payments-scroll-container">
                          <div className="payments-container">
                            {payments.map((payment) => (
                                <div key={payment.id} className="payment-card">
                                  <div className="payment-header">
                                    <div className="payment-title">
                                      <h4>{payment.ticketName}</h4>
                                      <span
                                          className={`payment-status-badge ${payment.status?.toLowerCase()}`}>
                                        {payment.status === 'DONE' ? '결제완료' :
                                            payment.status === 'CANCELLED'
                                                ? '결제취소' :
                                                payment.status === 'REFUNDED'
                                                    ? '환불완료' :
                                                    payment.status === 'PENDING'
                                                        ? '결제대기' : '완료'}
                                      </span>
                                    </div>
                                    <div className="payment-amount">
                                      {payment.status === 'REFUNDED' ? '-'
                                          : ''}₩{payment.amount.toLocaleString()}
                                    </div>
                                  </div>

                                  <div className="payment-body">
                                    <div className="payment-info">
                                      <div className="payment-info-row">
                                        <span
                                            className="payment-info-label">멘토</span>
                                        <span
                                            className="payment-info-value">{payment.mentorName}</span>
                                      </div>
                                      <div className="payment-info-row">
                                        <span
                                            className="payment-info-label">결제타입</span>
                                        <span
                                            className="payment-info-value">{payment.paymentType}</span>
                                      </div>
                                      {payment.approvedAt && (
                                          <div className="payment-info-row">
                                            <span
                                                className="payment-info-label">승인일시</span>
                                            <span
                                                className="payment-info-value">
                                              {new Date(
                                                  payment.approvedAt).toLocaleDateString(
                                                  'ko-KR')}
                                            </span>
                                          </div>
                                      )}
                                    </div>

                                    <div className="payment-date-section">
                                      <div className="payment-date-item">
                                        <CreditCard
                                            className="payment-date-icon"/>
                                        <div className="payment-date-details">
                                          <div className="payment-date-label">
                                            {payment.status === 'REFUNDED'
                                                ? '환불일시' : '결제일시'}
                                          </div>
                                          <div className="payment-date-value">
                                            {new Date(
                                                payment.createdAt).toLocaleDateString(
                                                'ko-KR', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                                  weekday: 'short'
                                                })}
                                          </div>
                                          <div className="payment-time-value">
                                            {new Date(
                                                payment.createdAt).toLocaleTimeString(
                                                'ko-KR', {
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="payment-actions">
                                    <button className="action-btn outline">
                                      <Eye size={16}/>
                                      상세보기
                                    </button>
                                    {payment.status === 'DONE' && (
                                        <button
                                            className="action-btn secondary">
                                          <FileText size={16}/>
                                          영수증
                                        </button>
                                    )}
                                  </div>
                                </div>
                            ))}
                          </div>

                          <div className="scroll-guide">
                            <span>더 많은 결제 내역을 보려면 스크롤하세요</span>
                          </div>
                        </div>
                    )}
                  </div>
              )}

              {activeTab === 'inquiries' && (
                  <div className="inquiries-tab">
                    <div className="section-header">
                      <h3>민원 내역</h3>
                      <p>문의 및 신고 내역을 확인하고 관리하세요</p>
                    </div>

                    {tabLoadingStates.complaints ? (
                        <div className="loading-state">
                          <div className="loading-spinner"></div>
                          <p>민원 내역을 불러오는 중...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                          <FileText className="error-icon"/>
                          <h4>오류가 발생했습니다</h4>
                          <p>{error}</p>
                          <button className="retry-btn" onClick={() => {
                            setTabDataLoaded(
                                prev => ({...prev, complaints: false}));
                            setError(null);
                            fetchComplaints();
                          }}>
                            다시 시도
                          </button>
                        </div>
                    ) : complaints.length === 0 ? (
                        <div className="empty-state">
                          <FileText className="empty-icon"/>
                          <h4>민원 내역이 없습니다</h4>
                          <p>문의사항이 있으시면 고객센터로 연락해주세요!</p>
                        </div>
                    ) : (
                        <div className="complaints-scroll-container">
                          <div className="complaints-container">
                            {complaints.map((complaint) => (
                                <div key={complaint.id}
                                     className="complaint-card">
                                  <div className="complaint-header">
                                    <div className="complaint-title-section">
                                      <div className="complaint-type-badge">
                                        {complaint.type === 'COMPLAINT' &&
                                            <AlertTriangle size={16}/>}
                                        {complaint.type === 'INQUIRY_ACCOUNT' &&
                                            <User size={16}/>}
                                        {complaint.type === 'INQUIRY_CHAT' &&
                                            <MessageSquare size={16}/>}
                                        {complaint.type === 'INQUIRY_PAY' &&
                                            <CreditCard size={16}/>}
                                        {complaint.type
                                            === 'INQUIRY_RESERVATION' &&
                                            <BookOpen size={16}/>}
                                        {complaint.type === 'INQUIRY_TICKET' &&
                                            <FileText size={16}/>}
                                        {complaint.type === 'INQUIRY_PROFILE' &&
                                            <Settings size={16}/>}
                                        <span>
                                          {complaint.type === 'COMPLAINT' ? '민원'
                                              :
                                              complaint.type
                                              === 'INQUIRY_ACCOUNT' ? '계정 문의' :
                                                  complaint.type
                                                  === 'INQUIRY_CHAT' ? '채팅 문의' :
                                                      complaint.type
                                                      === 'INQUIRY_PAY'
                                                          ? '결제 문의' :
                                                          complaint.type
                                                          === 'INQUIRY_RESERVATION'
                                                              ? '예약 문의' :
                                                              complaint.type
                                                              === 'INQUIRY_TICKET'
                                                                  ? '이용권 문의' :
                                                                  complaint.type
                                                                  === 'INQUIRY_PROFILE'
                                                                      ? '프로필 문의'
                                                                      : complaint.type}
                                        </span>
                                      </div>
                                      <h4 className="complaint-title">{complaint.title}</h4>
                                    </div>
                                    <div className="complaint-status-section">
                                      <span
                                          className={`complaint-status-badge ${complaint.status?.toLowerCase()}`}>
                                        {complaint.status === 'PENDING' &&
                                            <Clock size={14}/>}
                                        {complaint.status === 'RESOLVED' &&
                                            <CheckCircle size={14}/>}
                                        <span>
                                          {complaint.status === 'PENDING' ? '보류'
                                              :
                                              complaint.status === 'RESOLVED'
                                                  ? '완료' : complaint.status}
                                        </span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="complaint-body">
                                    <div className="complaint-content">
                                      <p className="complaint-description">
                                        {complaint.description
                                        && complaint.description.length > 100
                                            ? `${complaint.description.substring(
                                                0, 100)}...`
                                            : complaint.description
                                            || '내용이 없습니다.'}
                                      </p>
                                    </div>

                                    <div className="complaint-meta">
                                      <div className="complaint-date-info">
                                        <Calendar className="meta-icon"/>
                                        <div className="date-details">
                                          <div className="date-label">접수일시</div>
                                          <div className="date-value">
                                            {new Date(
                                                complaint.createdAt).toLocaleDateString(
                                                'ko-KR', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                                  weekday: 'short'
                                                })}
                                          </div>
                                          <div className="time-value">
                                            {new Date(
                                                complaint.createdAt).toLocaleTimeString(
                                                'ko-KR', {
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                })}
                                          </div>
                                        </div>
                                      </div>

                                      {complaint.status === 'RESOLVED'
                                          && complaint.resolvedAt && (
                                              <div
                                                  className="complaint-resolved-info">
                                                <CheckCircle
                                                    className="meta-icon resolved"/>
                                                <div className="date-details">
                                                  <div
                                                      className="date-label">완료일시
                                                  </div>
                                                  <div className="date-value">
                                                    {new Date(
                                                        complaint.resolvedAt).toLocaleDateString(
                                                        'ko-KR', {
                                                          year: 'numeric',
                                                          month: 'long',
                                                          day: 'numeric'
                                                        })}
                                                  </div>
                                                </div>
                                              </div>
                                          )}
                                    </div>
                                  </div>

                                  <div className="complaint-actions">
                                    <button className="action-btn outline">
                                      <Eye size={16}/>
                                      상세보기
                                    </button>
                                    {complaint.status === 'RESOLVED' && (
                                        <button
                                            className="action-btn secondary">
                                          <MessageSquare size={16}/>
                                          답변 확인
                                        </button>
                                    )}
                                    {complaint.status === 'PENDING' && (
                                        <button
                                            className="action-btn secondary">
                                          <Edit3 size={16}/>
                                          수정
                                        </button>
                                    )}
                                  </div>
                                </div>
                            ))}
                          </div>

                          <div className="scroll-guide">
                            <span>더 많은 민원 내역을 보려면 스크롤하세요</span>
                          </div>
                        </div>
                    )}
                  </div>
              )}

              {/* 멘토 전용 탭들 */}
              {userInfo.userRole === 'MENTOR' && (
                  <>
                    {activeTab === 'mentorRegister' && (
                        <div className="mentor-register-tab">
                          <div className="section-header">
                            <div className="header-content">
                              <div className="header-text">
                                <h3>✨ 내 멘토 프로필</h3>
                                <p>전문성을 세상에 공유하고 성장을 이끌어주세요</p>
                              </div>
                              <div className="header-stats">
                                <div className="stat-item">
                                  <span className="stat-number">{profiles.length}</span>
                                  <span className="stat-label">활성 프로필</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {tabLoadingStates.mentorProfile ? (
                              <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>멘토 프로필을 불러오는 중...</p>
                              </div>
                          ) : error ? (
                              <div className="error-state">
                                <UserPlus className="error-icon"/>
                                <h4>오류가 발생했습니다</h4>
                                <p>{error}</p>
                                <button className="retry-btn" onClick={() => {
                                  setTabDataLoaded(prev => ({...prev, mentorProfile: false}));
                                  setError(null);
                                  fetchMentorProfile();
                                }}>
                                  다시 시도
                                </button>
                              </div>
                          ) : profiles.length > 0 ? (
                              <div className="mentor-profiles-grid">
                                {profiles.map((profile, index) => (
                                    <div key={profile.id} className="mentor-profile-card" style={{animationDelay: `${index * 0.1}s`}}>
                                      {/* 프로필 헤더 */}
                                      <div className="profile-card-header">
                                        <div className="profile-avatar">
                                          <div className="avatar-initials">
                                            {profile.name ? profile.name.charAt(0) : 'M'}
                                          </div>
                                          <div className="status-dot"></div>
                                        </div>
                                        <div className="profile-basic-info">
                                          <h4 className="profile-name">{profile.name}님</h4>
                                          <p className="profile-title">{profile.title}</p>
                                          <div className="profile-category">
                                            <span className="category-badge">{profile.category || '미지정'}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* 프로필 본문 */}
                                      <div className="profile-card-body">
                                        <div className="introduction-section">
                                          <h5 className="section-title">🎯 소개</h5>
                                          <p className="introduction-text">
                                            {profile.introduction ? 
                                              (profile.introduction.length > 120 ? 
                                                `${profile.introduction.substring(0, 120)}...` : 
                                                profile.introduction) :
                                              '멘토 소개가 아직 작성되지 않았습니다.'
                                            }
                                          </p>
                                        </div>

                                        {profile.keywords && profile.keywords.length > 0 && (
                                            <div className="keywords-section">
                                              <h5 className="section-title">🏷️ 전문 키워드</h5>
                                              <div className="keywords-container">
                                                {profile.keywords.slice(0, 6).map((keyword, idx) => (
                                                    <span key={idx} className="keyword-tag">
                                                      {keyword.name}
                                                    </span>
                                                ))}
                                                {profile.keywords.length > 6 && (
                                                    <span className="keyword-tag more">
                                                      +{profile.keywords.length - 6}
                                                    </span>
                                                )}
                                              </div>
                                            </div>
                                        )}

                                        <div className="profile-stats">
                                          <div className="stat-row">
                                            <div className="stat-item-small">
                                              <Calendar className="stat-icon"/>
                                              <span>등록일: {new Date(profile.createdAt || Date.now()).toLocaleDateString('ko-KR')}</span>
                                            </div>
                                            <div className="stat-item-small">
                                              <CheckCircle className="stat-icon"/>
                                              <span>승인 완료</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* 프로필 푸터 */}
                                      <div className="profile-card-footer">
                                        <button 
                                          className="profile-action-btn primary"
                                          onClick={() => handleViewMentorProfile(profile.id)}
                                        >
                                          <Eye size={16}/>
                                          프로필 미리보기
                                        </button>
                                        <button className="profile-action-btn secondary">
                                          <Edit3 size={16}/>
                                          수정하기
                                        </button>
                                      </div>

                                      {/* 호버 이펙트를 위한 장식 요소 */}
                                      <div className="card-glow"></div>
                                    </div>
                                ))}

                                {/* 새 프로필 추가 카드 */}
                                <div className="add-profile-card">
                                  <div className="add-card-content">
                                    <div className="add-icon-container">
                                      <UserPlus className="add-icon"/>
                                    </div>
                                    <h4>새 프로필 만들기</h4>
                                    <p>다른 분야의 전문성을 추가로 등록해보세요</p>
                                    <button className="add-profile-btn">
                                      <span>프로필 추가</span>
                                      <ArrowRight size={16}/>
                                    </button>
                                  </div>
                                </div>
                              </div>
                          ) : (
                              <div className="mentor-onboarding">
                                <div className="onboarding-visual">
                                  <div className="floating-cards">
                                    <div className="demo-card card-1">
                                      <div className="demo-content">
                                        <div className="demo-avatar"></div>
                                        <div className="demo-text"></div>
                                      </div>
                                    </div>
                                    <div className="demo-card card-2">
                                      <div className="demo-content">
                                        <div className="demo-avatar"></div>
                                        <div className="demo-text"></div>
                                      </div>
                                    </div>
                                    <div className="demo-card card-3">
                                      <div className="demo-content">
                                        <div className="demo-avatar"></div>
                                        <div className="demo-text"></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="hero-icon">
                                    <UserPlus className="main-icon"/>
                                  </div>
                                </div>
                                
                                <div className="onboarding-content">
                                  <h3 className="onboarding-title">🚀 멘토로 활동을 시작해보세요!</h3>
                                  <p className="onboarding-description">
                                    당신의 전문 지식과 경험을 공유하여 다른 사람들의 성장을 도와주세요. 
                                    멘토 프로필을 만들고 의미 있는 멘토링을 시작할 수 있습니다.
                                  </p>
                                  
                                  <div className="onboarding-features">
                                    <div className="feature-item">
                                      <div className="feature-icon">
                                        <Briefcase size={20}/>
                                      </div>
                                      <div className="feature-text">
                                        <h5>전문성 공유</h5>
                                        <p>경력과 스킬을 체계적으로 정리</p>
                                      </div>
                                    </div>
                                    <div className="feature-item">
                                      <div className="feature-icon">
                                        <MessageSquare size={20}/>
                                      </div>
                                      <div className="feature-text">
                                        <h5>1:1 멘토링</h5>
                                        <p>개인 맞춤형 상담 서비스 제공</p>
                                      </div>
                                    </div>
                                    <div className="feature-item">
                                      <div className="feature-icon">
                                        <CreditCard size={20}/>
                                      </div>
                                      <div className="feature-text">
                                        <h5>수익 창출</h5>
                                        <p>지식을 통한 부가 수입 확보</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="cta-section">
                                    <button className="cta-button">
                                      <span>멘토 프로필 만들기</span>
                                      <ArrowRight size={20}/>
                                    </button>
                                    <p className="cta-helper">
                                      ✨ 5분만 투자하면 멘토 활동을 시작할 수 있어요!
                                    </p>
                                  </div>
                                </div>
                              </div>
                          )}
                        </div>
                    )}

                    {activeTab === 'careers' && (
                        <div className="careers-tab">
                          <div className="section-header">
                            <h3>경력 목록</h3>
                            <p>멘토링에 표시될 경력 사항을 관리하세요</p>
                          </div>

                          {tabLoadingStates.careers ? (
                              <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>경력 내역을 불러오는 중...</p>
                              </div>
                          ) : error ? (
                              <div className="error-state">
                                <Briefcase className="error-icon"/>
                                <h4>오류가 발생했습니다</h4>
                                <p>{error}</p>
                                <button className="retry-btn" onClick={() => {
                                  setTabDataLoaded(
                                      prev => ({...prev, careers: false}));
                                  setError(null);
                                  fetchCareers();
                                }}>
                                  다시 시도
                                </button>
                              </div>
                          ) : careers.length > 0 ? (
                              <div className="careers-scroll-container">
                                <div className="careers-container">
                                  {careers.map((career, index) => (
                                      <div key={career.id}
                                           className="career-card">
                                        <div className="career-number">{index
                                            + 1}</div>
                                        <div className="career-content">
                                          <div className="career-header">
                                            <div
                                                className="career-title-section">
                                              <h4 className="career-company">{career.company}</h4>
                                              <span
                                                  className="career-position">{career.position
                                                  || '직책'}</span>
                                            </div>
                                            {career.isCurrent && (
                                                <span
                                                    className="career-current-badge">재직중</span>
                                            )}
                                          </div>

                                          <div className="career-details">
                                            <div className="career-period">
                                              <Calendar className="career-icon"
                                                        size={16}/>
                                              <span className="career-date">
                                                {career.startAt} ~ {career.endAt
                                                  || '현재'}
                                              </span>
                                              {career.duration && (
                                                  <span
                                                      className="career-duration">({career.duration})</span>
                                              )}
                                            </div>

                                            {career.department && (
                                                <div
                                                    className="career-department">
                                                  <Briefcase
                                                      className="career-icon"
                                                      size={16}/>
                                                  <span>{career.department}</span>
                                                </div>
                                            )}
                                          </div>

                                          {career.description && (
                                              <div
                                                  className="career-description-section">
                                                <p className="career-description">{career.description}</p>
                                              </div>
                                          )}

                                          {career.skills && career.skills.length
                                              > 0 && (
                                                  <div
                                                      className="career-skills">
                                                    {career.skills.map(
                                                        (skill, idx) => (
                                                            <span key={idx}
                                                                  className="skill-tag">{skill}</span>
                                                        ))}
                                                  </div>
                                              )}

                                          <div className="career-actions">
                                            <button
                                                className="career-action-btn edit">
                                              <Edit3 size={14}/>
                                              수정
                                            </button>
                                            <button
                                                className="career-action-btn delete">
                                              <X size={14}/>
                                              삭제
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                  ))}
                                </div>

                                <div className="careers-footer">
                                  <button className="add-career-btn">
                                    <UserPlus size={18}/>
                                    새 경력 추가
                                  </button>
                                </div>

                                <div className="scroll-guide">
                                  <span>더 많은 경력을 보려면 스크롤하세요</span>
                                </div>
                              </div>
                          ) : (
                              <div className="empty-state">
                                <Briefcase className="empty-icon"/>
                                <h4>등록된 경력이 없습니다</h4>
                                <p>경력을 추가하여 프로필을 완성해보세요!</p>
                                <button className="empty-action-btn">
                                  <Briefcase size={18}/>
                                  첫 경력 추가하기
                                </button>
                              </div>
                          )}
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="schedule-tab">
                          <div className="section-header">
                            <h3>상담 가능 시간</h3>
                            <p>멘토링 가능한 시간대를 설정하세요</p>
                          </div>
                          <div className="empty-state">
                            <Clock className="empty-icon"/>
                            <p>상담 가능 시간이 설정되지 않았습니다.</p>
                            <span>시간을 설정하여 멘티들이 예약할 수 있도록 해주세요!</span>
                          </div>
                        </div>
                    )}
                  </>
              )}
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 모달 */}
        {showPasswordModal && (
            <div className="modal-overlay" onClick={closePasswordModal}>
              <div className="modal-container"
                   onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>비밀번호 변경</h3>
                  <button className="modal-close" onClick={closePasswordModal}>
                    <X size={24}/>
                  </button>
                </div>

                <div className="modal-body">
                  <div className="password-field">
                    <label>현재 비밀번호</label>
                    <div className="password-input-container">
                      <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value
                          })}
                          placeholder="현재 비밀번호를 입력하세요"
                          className="password-input"
                      />
                      <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <EyeOff size={20}/> : <Eye
                            size={20}/>}
                      </button>
                    </div>
                  </div>

                  <div className="password-field">
                    <label>새 비밀번호</label>
                    <div className="password-input-container">
                      <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(
                              {...passwordData, newPassword: e.target.value})}
                          placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                          className="password-input"
                      />
                      <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <EyeOff size={20}/> : <Eye
                            size={20}/>}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                      className="modal-btn cancel"
                      onClick={closePasswordModal}
                      disabled={modalLoading}
                  >
                    취소
                  </button>
                  <button
                      className="modal-btn confirm"
                      onClick={handlePasswordChange}
                      disabled={modalLoading || !passwordData.currentPassword
                          || !passwordData.newPassword}
                  >
                    {modalLoading ? (
                        <div className="spinner-small"></div>
                    ) : (
                        '변경하기'
                    )}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* 회원탈퇴 모달 */}
        {showDeleteModal && (
            <div className="modal-overlay" onClick={closeDeleteModal}>
              <div className="modal-container"
                   onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>회원탈퇴</h3>
                  <button className="modal-close" onClick={closeDeleteModal}>
                    <X size={24}/>
                  </button>
                </div>

                <div className="modal-body">
                  <div className="warning-message">
                    <div className="warning-icon">
                      <UserX size={48}/>
                    </div>
                    <h4>정말로 회원탈퇴를 하시겠습니까?</h4>
                    <p>회원탈퇴 시 모든 데이터가 영구적으로 삭제되며, 복구할 수 없습니다.</p>
                    <ul className="warning-list">
                      <li>프로필 정보</li>
                      <li>예약 및 결제 내역</li>
                      <li>멘토링 대화 기록</li>
                      <li>기타 모든 활동 데이터</li>
                    </ul>
                  </div>

                  <div className="password-field">
                    <label>현재 비밀번호를 입력하여 본인임을 확인해주세요</label>
                    <div className="password-input-container">
                      <input
                          type={showPasswords.delete ? "text" : "password"}
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="현재 비밀번호를 입력하세요"
                          className="password-input"
                      />
                      <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('delete')}
                      >
                        {showPasswords.delete ? <EyeOff size={20}/> : <Eye
                            size={20}/>}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                      className="modal-btn cancel"
                      onClick={closeDeleteModal}
                      disabled={modalLoading}
                  >
                    취소
                  </button>
                  <button
                      className="modal-btn delete"
                      onClick={handleAccountDelete}
                      disabled={modalLoading || !deletePassword}
                  >
                    {modalLoading ? (
                        <div className="spinner-small"></div>
                    ) : (
                        '회원탈퇴'
                    )}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default MyPage;
