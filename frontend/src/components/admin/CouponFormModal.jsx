import React, { useState, useEffect } from 'react';
import './CouponFormModal.css';

const CouponFormModal = ({ coupon, onSave, onClose, saving }) => {
  const [form, setForm] = useState({
    name: '',
    code: '',
    discountType: 'percent',
    discountValue: 0,
    minAmount: 0,
    usageLimit: 100,
    startDate: '',
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    if (coupon) {
      setForm({
        ...coupon,
        startDate: coupon.startDate?.split('T')[0] || '',
        endDate: coupon.endDate?.split('T')[0] || '',
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
    if (!form.name || !form.code || !form.startDate || !form.endDate) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    onSave(form);
  };

  return (
      <div className="modal-overlay">
        <div className="modal">
          <h3>{coupon ? '쿠폰 수정' : '쿠폰 등록'}</h3>
          <form onSubmit={handleSubmit}>
            <label>쿠폰명*</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>코드*</label>
            <input name="code" value={form.code} onChange={handleChange} required />

            <label>할인 유형*</label>
            <select name="discountType" value={form.discountType} onChange={handleChange}>
              <option value="percent">퍼센트(%)</option>
              <option value="fixed">정액(₩)</option>
            </select>

            <label>할인 값*</label>
            <input
                name="discountValue"
                type="number"
                min="1"
                value={form.discountValue}
                onChange={handleChange}
                required
            />

            <label>최소 결제 금액 (₩)</label>
            <input
                name="minAmount"
                type="number"
                min="0"
                value={form.minAmount}
                onChange={handleChange}
            />

            <label>사용 가능 횟수</label>
            <input
                name="usageLimit"
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={handleChange}
            />

            <label>시작일*</label>
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required />

            <label>종료일*</label>
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required />

            <label>
              <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
              />
              활성화 상태
            </label>

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