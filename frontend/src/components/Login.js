import React, { useState, useRef } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User, Phone, UserCheck } from 'lucide-react';
import './Login.css';
import logo from '../image/cool.png';

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // 회원가입 추가 필드
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [userType, setUserType] = useState('mentee'); // 'mentee' or 'mentor'

  // useRef는 컴포넌트 최상단에서 선언
  const phone2Ref = useRef(null);
  const phone3Ref = useRef(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      // TODO: 회원가입 로직 구현
      const phone = `${phone1}-${phone2}-${phone3}`;
      console.log('Sign Up:', { email, password, confirmPassword, name, nickname, phone, userType });
    } else {
      // 임시 로그인 성공 처리 (실제로는 API 호출)
      const userData = {
        id: 1,
        name: name || '테스트 사용자',
        email: email,
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        userType: 'mentee',
        joinDate: '2024.01.01',
        token: 'mock-jwt-token'
      };
      
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      console.log('Login:', { email, password });
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
    setUserType('mentee');
    setShowPassword(false);
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
                      checked={userType === 'mentee'}
                      onChange={(e) => setUserType(e.target.value)}
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

          <button type="submit" className="login-submit">
            {isSignUp ? '회원가입' : '로그인'}
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
