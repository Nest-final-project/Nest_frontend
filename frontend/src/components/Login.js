import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css';
import logo from '../image/cool.png';

const Login = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 로그인/회원가입 로직 구현
    console.log('Submit:', { email, password });
  };

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 구현
    console.log('Kakao login');
  };

  const handleNaverLogin = () => {
    // TODO: 네이버 로그인 구현
    console.log('Naver login');
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
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

          {isSignUp && (
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

        <div className="login-footer">
          <p>
            {isSignUp ? '이미 계정이 있으신가요?' : '아직 회원이 아니신가요?'}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
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
