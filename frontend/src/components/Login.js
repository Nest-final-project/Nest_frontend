import React, { useState, useRef } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User, Phone, UserCheck } from 'lucide-react';
import './Login.css';
import logo from '../image/cool.png';
import api, { authAPI } from '../services/api';
import { authUtils } from '../utils/tokenUtils';

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 회원가입 추가 필드
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [userStatus, setUserStatus] = useState('mentee'); // 'mentee' or 'mentor'

  // useRef는 컴포넌트 최상단에서 선언
  const phone2Ref = useRef(null);
  const phone3Ref = useRef(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // 입력값 유효성 검사
        if (!email.trim()) {
          setError('이메일을 입력해주세요.');
          setIsLoading(false);
          return;
        }

        if (!email.includes('@') || !email.includes('.')) {
          setError('올바른 이메일 형식이 아닙니다.');
          setIsLoading(false);
          return;
        }

        if (!password) {
          setError('비밀번호를 입력해주세요.');
          setIsLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('비밀번호는 8자 이상이어야 합니다.');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.');
          setIsLoading(false);
          return;
        }

        if (!name.trim()) {
          setError('이름을 입력해주세요.');
          setIsLoading(false);
          return;
        }

        if (!nickname.trim()) {
          setError('닉네임을 입력해주세요.');
          setIsLoading(false);
          return;
        }

        if (!phone1 || !phone2 || !phone3) {
          setError('전화번호를 모두 입력해주세요.');
          setIsLoading(false);
          return;
        }

        if (phone1.length !== 3 || phone2.length < 3 || phone3.length < 4) {
          setError('올바른 전화번호 형식이 아닙니다.');
          setIsLoading(false);
          return;
        }

        // AuthRequestDto 형태로 데이터 구성 (백엔드 필드명에 맞춤)
        const signupData = {
          email: email.trim(),
          password: password,
          name: name.trim(),
          nickName: nickname.trim(), // 백엔드는 nickName을 기대
          phoneNumber: `${phone1}-${phone2}-${phone3}`,
          userRole: userStatus.toUpperCase() // 백엔드는 userRole을 기대 (MENTEE 또는 MENTOR)
        };

        console.log('회원가입 요청 데이터:', signupData);
        console.log('전송할 필드들 확인:');
        console.log('- email:', signupData.email);
        console.log('- password:', signupData.password ? '***' : 'null');
        console.log('- name:', signupData.name);
        console.log('- nickName:', signupData.nickName);
        console.log('- phoneNumber:', signupData.phoneNumber);
        console.log('- userRole:', signupData.userRole);
        console.log('API URL:', api.API_BASE_URL);

        // 회원가입 API 호출
        const response = await authAPI.signup(signupData);
        
        console.log('회원가입 API 응답:', response);
        console.log('회원가입 성공 데이터:', response.data);
        
        // 회원가입 성공 시 로그인 모드로 전환
        setIsSignUp(false);
        resetForm();
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        
      } else {
        // 로그인 입력값 유효성 검사
        if (!email.trim()) {
          setError('이메일을 입력해주세요.');
          setIsLoading(false);
          return;
        }

        if (!password) {
          setError('비밀번호를 입력해주세요.');
          setIsLoading(false);
          return;
        }

        // LoginRequestDto 형태로 데이터 구성
        const loginData = {
          email: email.trim(),
          password: password
        };

        console.log('로그인 요청 데이터:', loginData);
        console.log('전송할 필드들 확인:');
        console.log('- email:', loginData.email);
        console.log('- password:', loginData.password ? '***' : 'null');
        console.log('API URL:', api.API_BASE_URL);

        try {
          // 실제 로그인 API 호출
          const response = await authAPI.login(loginData);
          console.log('로그인 API 응답:', response);
          console.log('로그인 성공 데이터:', response.data);
          
          // 백엔드에서 받은 사용자 데이터 처리
          const responseData = response.data.data || response.data;
          console.log('📋 로그인 응답 데이터:', responseData);
          
          // 토큰 추출
          const accessToken = responseData.accessToken || responseData.token;
          const refreshToken = responseData.refreshToken;
          
          if (!accessToken) {
            console.error('❌ accessToken이 응답에 없습니다');
            setError('인증 토큰을 받을 수 없습니다.');
            return;
          }
          
          console.log('🔑 토큰 추출 성공:', {
            accessToken: accessToken ? '있음' : '없음',
            refreshToken: refreshToken ? '있음' : '없음'
          });
          
          // 사용자 정보 구성
          const userInfo = {
            id: responseData.userId || responseData.id || responseData.user?.id,
            name: responseData.name || responseData.userName || responseData.user?.name,
            email: responseData.email || responseData.user?.email || email,
            profileImage: responseData.profileImage || responseData.user?.profileImage,
            userRole: responseData.userRole || responseData.user?.userRole,
            joinDate: responseData.joinDate || responseData.createdAt || responseData.user?.createdAt,
            token: accessToken
          };
          
          // 토큰 저장 (authUtils 사용)
          console.log('💾 토큰 저장 시작...');
          authUtils.setAuthData(accessToken, refreshToken, userInfo);
          
          // 저장 확인
          const savedToken = sessionStorage.getItem('accessToken');
          const savedUser = sessionStorage.getItem('userData');
          
          console.log('🔍 저장된 토큰 확인:', savedToken ? `있음 (${savedToken.length}자)` : '없음');
          console.log('🔍 저장된 사용자 정보:', savedUser ? '있음' : '없음');
          
          if (savedToken && savedUser) {
            console.log('✅ 저장 확인 성공');
            console.log('🔑 저장된 토큰 값:', savedToken);
            if (onLoginSuccess) {
              onLoginSuccess(userInfo);
            }
          } else {
            console.error('❌ 저장 확인 실패');
            setError('로그인 정보 저장에 실패했습니다.');
          }
          
        } catch (loginError) {
          console.error('로그인 실패:', loginError);
          console.error('로그인 에러 응답:', loginError.response);
          
          if (loginError.response?.status === 401) {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
          } else if (loginError.response?.status === 404) {
            setError('존재하지 않는 사용자입니다.');
          } else if (loginError.response?.data?.message) {
            setError(loginError.response.data.message);
          } else if (loginError.message.includes('Network Error') || loginError.code === 'ERR_NETWORK') {
            setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
          } else {
            setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
          }
          throw loginError; // 외부 catch에서 처리하도록
        }
      }
    } catch (error) {
      console.error('API 요청 실패:', error);
      console.error('에러 응답:', error.response);
      console.error('에러 메시지:', error.message);
      
      // 에러 메시지 처리
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.status === 409) {
        setError('이미 가입된 이메일입니다.');
      } else if (error.response?.status === 400) {
        setError('입력 정보를 다시 확인해주세요.');
      } else if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else {
        setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    // 백엔드 OAuth2 카카오 로그인 URL로 리다이렉트
    window.location.href = 'http://localhost:8080/oauth2/login/kakao';
  };

  const handleNaverLogin = () => {
    // 백엔드 OAuth2 네이버 로그인 URL로 리다이렉트
    window.location.href = 'http://localhost:8080/oauth2/login/naver';
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setNickname('');
    setPhone1('');
    setPhone2('');
    setPhone3('');
    setUserStatus('mentee');
    setShowPassword(false);
    setError('');
  };

  // 전화번호 입력 시 자동 포커스 이동
  const handlePhoneInput = (value, setter, nextRef) => {
    setter(value);
    if (value.length === 3 && nextRef) {
      nextRef.current?.focus();
    }
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className={`login-modal ${isSignUp ? 'signup-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="login-close" onClick={onClose}>
          <X className="icon" />
        </button>

        <div className="login-header">
          <img src={logo} alt="Nest.dev" className="login-logo" />
          <h2 className="login-title">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>
          <p className="login-subtitle">
            {isSignUp 
              ? 'Nest.dev에 오신 것을 환영합니다!' 
              : '다시 만나서 반가워요!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          {/* 이메일 */}
          <div className="input-group">
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="input-group">
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
              </button>
            </div>
          </div>

          {/* 회원가입 추가 필드들 */}
          {isSignUp && (
            <>
              {/* 비밀번호 확인 */}
              <div className="input-group">
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="login-input"
                    required
                  />
                </div>
              </div>

              {/* 이름 */}
              <div className="input-group">
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="login-input"
                    required
                  />
                </div>
              </div>

              {/* 닉네임 */}
              <div className="input-group">
                <div className="input-wrapper">
                  <UserCheck className="input-icon" />
                  <input
                    type="text"
                    placeholder="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="login-input"
                    required
                  />
                </div>
              </div>

              {/* 전화번호 */}
              <div className="input-group">
                <label className="input-label">
                  <Phone className="label-icon" />
                  전화번호
                </label>
                <div className="phone-input-wrapper">
                  <input
                    type="tel"
                    placeholder="010"
                    value={phone1}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                      handlePhoneInput(value, setPhone1, phone2Ref);
                    }}
                    className="phone-input"
                    maxLength="3"
                    required
                  />
                  <span className="phone-divider">-</span>
                  <input
                    ref={phone2Ref}
                    type="tel"
                    placeholder="0000"
                    value={phone2}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      handlePhoneInput(value, setPhone2, phone3Ref);
                    }}
                    className="phone-input"
                    maxLength="4"
                    required
                  />
                  <span className="phone-divider">-</span>
                  <input
                    ref={phone3Ref}
                    type="tel"
                    placeholder="0000"
                    value={phone3}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPhone3(value);
                    }}
                    className="phone-input"
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              {/* 사용자 유형 선택 */}
              <div className="user-type-group">
                <label className="user-type-label">가입 유형</label>
                <div className="user-type-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="userType"
                      value="mentee"
                      checked={userStatus === 'mentee'}
                      onChange={(e) => setUserStatus(e.target.value)}
                    />
                    <span className="radio-label">
                      <span className="radio-icon">🐣</span>
                      멘티로 가입
                    </span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="userType"
                      value="mentor"
                      checked={userStatus === 'mentor'}
                      onChange={(e) => setUserStatus(e.target.value)}
                    />
                    <span className="radio-label">
                      <span className="radio-icon">🦅</span>
                      멘토로 가입
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}

          {!isSignUp && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>로그인 상태 유지</span>
              </label>
              <a href="#forgot" className="forgot-password">
                비밀번호 찾기
              </a>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner">
                <span className="spinner"></span>
                {isSignUp ? '가입 중...' : '로그인 중...'}
              </span>
            ) : (
              isSignUp ? '회원가입' : '로그인'
            )}
          </button>
        </form>

        {!isSignUp && (
          <div className="social-login">
            <div className="divider">
              <span>간편 로그인</span>
            </div>

            <div className="social-buttons">
              <button 
                onClick={handleKakaoLogin}
                className="social-button kakao"
              >
                <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" alt="카카오" />
                <span>카카오로 시작하기</span>
              </button>

              <button 
                onClick={handleNaverLogin}
                className="social-button naver"
              >
                <div className="naver-logo">N</div>
                <span>네이버로 시작하기</span>
              </button>
            </div>
          </div>
        )}

        <div className="login-footer">
          <p>
            {isSignUp ? '이미 계정이 있으신가요?' : '아직 회원이 아니신가요?'}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                resetForm();
              }}
              className="toggle-mode"
            >
              {isSignUp ? '로그인하기' : '회원가입하기'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
