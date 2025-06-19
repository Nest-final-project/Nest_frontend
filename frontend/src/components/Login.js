import React, { useState, useRef } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User, Phone, UserCheck } from 'lucide-react';
import './Login.css';
import logo from '../image/cool.png';
import { authAPI } from '../services/api';
import useAuth from '../hooks/useAuth';

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
  const [userType, setUserType] = useState('mentee'); // 'mentee' or 'mentor'

  // 인증 훅 사용
  const { login } = useAuth();

  // useRef는 컴포넌트 최상단에서 선언
  const phone2Ref = useRef(null);
  const phone3Ref = useRef(null);

  if (!isOpen) return null;

  const validateForm = () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return false;
    }

    if (!email.includes('@')) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return false;
      }

      if (password.length < 6) {
        setError('비밀번호는 6자 이상이어야 합니다.');
        return false;
      }

      if (!name || !nickname) {
        setError('이름과 닉네임을 입력해주세요.');
        return false;
      }

      if (!phone1 || !phone2 || !phone3) {
        setError('전화번호를 모두 입력해주세요.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // 회원가입 처리
        const phone = `${phone1}-${phone2}-${phone3}`;
        const signupData = {
          email,
          password,
          name,
          nickname,
          phone,
          role: userType.toUpperCase() // MENTEE or MENTOR
        };

        const response = await authAPI.signup(signupData);
        
        if (response.status === 200 || response.status === 201) {
          // 회원가입 성공 후 자동 로그인
          await handleLogin();
        }
      } else {
        // 로그인 처리
        await handleLogin();
      }
    } catch (error) {
      console.error('인증 오류:', error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const credentials = { email, password };
      await login(credentials);
      
      // 로그인 성공
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // 성공 알림
      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: '로그인 성공',
          message: `안녕하세요! Nest.dev에 오신 것을 환영합니다.`,
          autoClose: true,
          duration: 3000
        });
      }
    } catch (error) {
      throw error; // 상위에서 에러 처리
    }
  };

  const handleAuthError = (error) => {
    let errorMessage = '알 수 없는 오류가 발생했습니다.';
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data.message || '잘못된 요청입니다.';
          break;
        case 401:
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
          break;
        case 409:
          errorMessage = '이미 존재하는 이메일입니다.';
          break;
        case 500:
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          break;
        default:
          errorMessage = data.message || '인증에 실패했습니다.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
  };

  const handleKakaoLogin = () => {
    // 백엔드 OAuth2 카카오 로그인 URL로 리다이렉트
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/oauth2/login/kakao`;
  };

  const handleNaverLogin = () => {
    // 백엔드 OAuth2 네이버 로그인 URL로 리다이렉트
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/oauth2/login/naver`;
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
    setUserType('mentee');
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

        {/* 에러 메시지 표시 */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                      checked={userType === 'mentee'}
                      onChange={(e) => setUserType(e.target.value)}
                      disabled={isLoading}
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
                      checked={userType === 'mentor'}
                      onChange={(e) => setUserType(e.target.value)}
                      disabled={isLoading}
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
                <input type="checkbox" disabled={isLoading} />
                <span>로그인 상태 유지</span>
              </label>
              <a href="#forgot" className="forgot-password">
                비밀번호 찾기
              </a>
            </div>
          )}

          <button 
            type="submit" 
            className="login-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-text">
                <span className="loading-spinner"></span>
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
                disabled={isLoading}
              >
                <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" alt="카카오" />
                <span>카카오로 시작하기</span>
              </button>

              <button 
                onClick={handleNaverLogin}
                className="social-button naver"
                disabled={isLoading}
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
              disabled={isLoading}
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