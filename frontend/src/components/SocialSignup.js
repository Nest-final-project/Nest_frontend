import React, { useState, useRef } from 'react';
import { User, Phone } from 'lucide-react';
import './SocialSignup.css';
import logo from '../image/cool.png';

const SocialSignup = () => {
  const [name, setName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [userType, setUserType] = useState('mentee');

  const phone2Ref = useRef(null);
  const phone3Ref = useRef(null);

  // 전화번호 입력 시 자동 포커스 이동
  const handlePhoneInput = (value, setter, nextRef) => {
    setter(value);
    if (value.length === 3 && nextRef) {
      nextRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phone = `${phone1}-${phone2}-${phone3}`;
    // TODO: 추가 정보 저장 API 호출
    console.log('Additional Info:', { name, phone, userType });
  };

  return (
    <div className="social-signup-container">
      <div className="social-signup-card">
        <div className="social-signup-header">
          <img src={logo} alt="Nest.dev" className="social-signup-logo" />
          <h2 className="social-signup-title">추가 정보 입력</h2>
          <p className="social-signup-subtitle">
            서비스 이용을 위해 추가 정보를 입력해주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="social-signup-form">
          {/* 이름 */}
          <div className="form-group">
            <label className="form-label">
              <User className="label-icon" />
              이름
            </label>
            <input
              type="text"
              placeholder="실명을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* 전화번호 */}
          <div className="form-group">
            <label className="form-label">
              <Phone className="label-icon" />
              전화번호
            </label>
            <div className="phone-inputs">
              <input
                type="tel"
                placeholder="010"
                value={phone1}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                  handlePhoneInput(value, setPhone1, phone2Ref);
                }}
                className="phone-field"
                maxLength="3"
                required
              />
              <span className="phone-separator">-</span>
              <input
                ref={phone2Ref}
                type="tel"
                placeholder="0000"
                value={phone2}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  handlePhoneInput(value, setPhone2, phone3Ref);
                }}
                className="phone-field"
                maxLength="4"
                required
              />
              <span className="phone-separator">-</span>
              <input
                ref={phone3Ref}
                type="tel"
                placeholder="0000"
                value={phone3}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPhone3(value);
                }}
                className="phone-field"
                maxLength="4"
                required
              />
            </div>
          </div>

          {/* 사용자 유형 선택 */}
          <div className="form-group">
            <label className="form-label">가입 유형</label>
            <div className="user-type-options">
              <label className="user-type-option">
                <input
                  type="radio"
                  name="userType"
                  value="mentee"
                  checked={userType === 'mentee'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                <span className="option-content">
                  <span className="option-icon">🐣</span>
                  <span className="option-text">
                    <strong>멘티로 가입</strong>
                    <small>전문가의 도움을 받고 싶어요</small>
                  </span>
                </span>
              </label>
              <label className="user-type-option">
                <input
                  type="radio"
                  name="userType"
                  value="mentor"
                  checked={userType === 'mentor'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                <span className="option-content">
                  <span className="option-icon">🦅</span>
                  <span className="option-text">
                    <strong>멘토로 가입</strong>
                    <small>나의 전문성을 공유하고 싶어요</small>
                  </span>
                </span>
              </label>
            </div>
          </div>

          <button type="submit" className="submit-button">
            회원가입 완료
          </button>
        </form>

        <div className="social-signup-footer">
          <p className="footer-text">
            가입을 진행하면 Nest.dev의 
            <a href="#terms"> 이용약관</a> 및 
            <a href="#privacy"> 개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialSignup;
