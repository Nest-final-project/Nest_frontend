import React, { useState, useEffect } from 'react';
import './CouponFormModal.css';

const CouponFormModal = ({ coupon, onSave, onClose, saving }) => {
  const [form, setForm] = useState({
    name: '',
    discountAmount: '',
    totalQuantity: '', //총 쿠폰 수
    issuedQuantity: '', // 발급된 쿠폰 수
    startDate: '',
    validFrom: '', // 유효 시작일
    validTo: '',  // 유효 종료일
    minGrade: ''
  });

  useEffect(() => {
    if (coupon) {
      setForm({
        ...coupon,
        startDate: coupon.startDate?.split('T')[0] || '',
        validFrom: coupon.validFrom?.split('T')[0] || '',
        validTo: coupon.validTo?.split('T')[0] || '',
      });
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🔍 폼 제출 시작:', form);
    
    // 필수 항목 검증
    if (!form.name || !form.validFrom || !form.validTo || !form.minGrade) {
      console.warn('⚠️ 필수 항목 누락:', {
        name: !!form.name,
        validFrom: !!form.validFrom,
        validTo: !!form.validTo,
        minGrade: !!form.minGrade
      });
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    // 할인 금액 검증
    if (!form.discountAmount || form.discountAmount <= 0) {
      console.warn('⚠️ 할인 금액이 유효하지 않음:', form.discountAmount);
      alert('할인 금액을 올바르게 입력해주세요.');
      return;
    }
    
    // 총 쿠폰 수 검증
    if (!form.totalQuantity || form.totalQuantity <= 0) {
      console.warn('⚠️ 총 쿠폰 수가 유효하지 않음:', form.totalQuantity);
      alert('총 쿠폰 수를 올바르게 입력해주세요.');
      return;
    }
    
    // 날짜를 DateTime 형식으로 변환
    const formattedData = {
      ...form,
      startDate: form.startDate ? new Date(form.startDate + 'T00:00:00').toISOString() : null,
      validFrom: form.validFrom ? new Date(form.validFrom + 'T00:00:00').toISOString() : null,
      validTo: form.validTo ? new Date(form.validTo + 'T23:59:59').toISOString() : null,
    };
    
    console.log('✅ 유효성 검사 통과, DateTime 변환 완료:', formattedData);
    onSave(formattedData);
  };

  return (
      <div className="modal-overlay">
        <div className="modal">
          <h3>{coupon ? '쿠폰 수정' : '쿠폰 등록'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" data-field="name">
              <label htmlFor="name">쿠폰명</label>
              <input 
                id="name"
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="예: 신규가입 환영 쿠폰"
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group" data-field="discountAmount">
                <label htmlFor="discountAmount">할인 금액 (₩)</label>
                <input
                  id="discountAmount"
                  name="discountAmount"
                  type="number"
                  min="1"
                  value={form.discountAmount}
                  onChange={handleChange}
                  placeholder="5000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalQuantity">총 쿠폰 수</label>
                <input
                  id="totalQuantity"
                  name="totalQuantity"
                  type="number"
                  min="1"
                  value={form.totalQuantity}
                  onChange={handleChange}
                  placeholder="1000"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="issuedQuantity">발급된 쿠폰 수</label>
                <input
                  id="issuedQuantity"
                  name="issuedQuantity"
                  type="number"
                  min="0"
                  value={form.issuedQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  readOnly={!coupon} // 신규 생성 시에는 수정 불가
                />
              </div>

              <div className="form-group">
                <label htmlFor="startDate">등록일</label>
                <input 
                  id="startDate"
                  name="startDate" 
                  type="date" 
                  value={form.startDate} 
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="validFrom">유효 시작일</label>
                <input 
                  id="validFrom"
                  name="validFrom" 
                  type="date" 
                  value={form.validFrom} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="validTo">유효 종료일</label>
                <input 
                  id="validTo"
                  name="validTo" 
                  type="date" 
                  value={form.validTo} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="minGrade">최소 등급</label>
              <select
                id="minGrade"
                name="minGrade"
                value={form.minGrade}
                onChange={handleChange}
                required
              >
                <option value="">등급을 선택하세요</option>
                <option value="SEED">SEED (씨앗)</option>
                <option value="SPROUT">SPROUT (새싹)</option>
                <option value="BRANCH">BRANCH (가지)</option>
                <option value="BLOOM">BLOOM (꽃)</option>
                <option value="NEST">NEST (둥지)</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={onClose} disabled={saving}>취소</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default CouponFormModal;