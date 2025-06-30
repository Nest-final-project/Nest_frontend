import React, { useState, useEffect } from 'react';
import {Plus, Edit3, Trash2, RefreshCw, Gift, Calendar, Users } from 'lucide-react';
import './AdminCommon.css';
import {adminAPI} from "../../services/api.js";
import {accessTokenUtils} from "../../utils/tokenUtils.js";
import CouponFormModal from './CouponFormModal.jsx';

const CouponManagement = ({ isDarkMode }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);


  useEffect(() => {
    // 인증 토큰 확인
    const token = accessTokenUtils.getAccessToken();
    console.log('🔑 현재 토큰 상태:', token ? '존재함' : '없음');
    
    if (!token) {
      console.warn('⚠️ 인증 토큰이 없습니다. 로그인이 필요합니다.');
      alert('관리자 로그인이 필요합니다.');
      setCoupons([]);
      return;
    }
    
    // 실제 백엔드 API 호출로 데이터 로드
    
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.findCoupons();
      
      // 응답 데이터 구조 분석 및 파싱
      let couponData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          couponData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          couponData = response.data.data;
        } else if (response.data.data && response.data.data.content && Array.isArray(response.data.data.content)) {
          couponData = response.data.data.content;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          couponData = response.data.content;
        } else {
          couponData = [];
        }
      }
      
      setCoupons(couponData);
      
    } catch (error) {
      console.error('❌ 쿠폰 목록 조회 실패:', error);
      
      // 에러 발생 시 빈 배열로 설정
      setCoupons([]);
      
      // 구체적인 에러 메시지 표시
      let errorMessage = '쿠폰 목록을 불러오는데 실패했습니다.';
      
      if (error.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (error.response?.status === 403) {
        errorMessage = '쿠폰 관리 권한이 없습니다.';
      } else if (error.response?.status === 404) {
        errorMessage = '쿠폰 API를 찾을 수 없습니다.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      console.error(`💥 에러 상세: ${errorMessage}`);
      alert(`오류: ${errorMessage}`);
      
    } finally {
      setLoading(false);
    }
  };


  const [saving, setSaving] = useState(false);

  const handleSaveCoupon = async (couponData) => {
    setSaving(true);
    try {
      if (couponData.id) {
        console.log(`📝 쿠폰 수정 시작: ID ${couponData.id}`, couponData);
        await adminAPI.updateCoupon(couponData.id, couponData);
        console.log('✅ 쿠폰 수정 성공');
        alert('쿠폰이 성공적으로 수정되었습니다.');
      } else {
        console.log('🆕 새 쿠폰 등록 시작:', couponData);
        await adminAPI.registerCoupon(couponData);
        console.log('✅ 쿠폰 등록 성공');
        alert('쿠폰이 성공적으로 등록되었습니다.');
      }
      
      setShowCreateModal(false);
      setSelectedCoupon(null);
      await loadCoupons(); // 목록 새로고침
    } catch (error) {
      console.error('❌ 쿠폰 저장 실패:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          '쿠폰 저장에 실패했습니다.';
      alert(`저장 실패: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setShowCreateModal(true);
  };

  const handleDelete = async (couponId) => {
    if (window.confirm('정말로 이 쿠폰을 삭제하시겠습니까?')) {
      try {
        console.log(`🗑️ 쿠폰 삭제 시작: ID ${couponId}`);
        await adminAPI.deleteCoupon(couponId);
        console.log('✅ 쿠폰 삭제 성공');
        
        // 성공 시 목록에서 제거
        setCoupons(coupons.filter(coupon => coupon.id !== couponId));
        alert('쿠폰이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('❌ 쿠폰 삭제 실패:', error);
        alert('쿠폰 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const formatDiscount = (type, value) => {
    return type === 'percent' ? `${value}%` : `₩${value.toLocaleString()}`;
  };

  return (
    <div className={`admin-content-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="content-header">
        <div className="header-left">
          <h2 className="coupon-title">
            <Gift size={28} />
            쿠폰 관리
          </h2>
          <p>할인 쿠폰을 생성하고 관리합니다</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadCoupons}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            새로고침
          </button>
          <button 
            className="btn-secondary"
            style={{ border: '2px solid rgb(91,222,8)', background: 'rgb(91,222,8)', color: 'white' }}
            onClick={() => {
              setSelectedCoupon(null);
              setShowCreateModal(true);
            }}
          >
            <Plus size={18} />
            쿠폰 추가
          </button>
        </div>
      </div>


      <div className="content-table coupon-table">
        <div className="table-header">
          <div className="table-cell">쿠폰 정보</div>
          <div className="table-cell">할인</div>
          <div className="table-cell">사용률</div>
          <div className="table-cell">기간</div>
          <div className="table-cell">작업</div>
        </div>

        {(() => {
          if (loading) {
            return (
              <div className="loading-state">
                <RefreshCw className="spinning" size={24} />
                <p>쿠폰 데이터를 불러오는 중...</p>
              </div>
            );
          } else if (coupons.length === 0) {
            return (
              <div className="empty-state">
                <Gift size={48} />
                <h3>쿠폰이 없습니다</h3>
                <p>새로운 쿠폰을 추가해보세요</p>
              </div>
            );
          } else {
            return coupons.map((coupon) => (
            <div key={coupon.id} className="table-row">
              <div className="table-cell">
                <div className="cell-content">
                  <Gift size={16} />
                  <strong>{coupon.name || coupon.couponName || '이름 없음'}</strong>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <div>₩{(coupon.discountAmount || 0).toLocaleString()}</div>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Users size={16} />
                  <div>
                    <div>{coupon.issuedQuantity || 0} / {coupon.totalQuantity || 0}</div>
                    <div className="usage-bar">
                      <div 
                        className="usage-fill"
                        style={{ 
                          width: `${((coupon.issuedQuantity || 0) / (coupon.totalQuantity || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Calendar size={16} />
                  <div>
                    <div>{(coupon.validFrom || '시작일 없음').replace('T', ' ').substring(0, 16)}</div>
                    ~ {(coupon.validTo || '종료일 없음').replace('T', ' ').substring(0, 16)}
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <div className="table-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => handleEdit(coupon)}
                    title="수정"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => handleDelete(coupon.id)}
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ));
          }
        })()}
      </div>

      {showCreateModal && (
          <CouponFormModal
              coupon={selectedCoupon}
              onSave={handleSaveCoupon}
              onClose={() => setShowCreateModal(false)}
              saving={saving}
          />
      )}
    </div>

  );
};

export default CouponManagement;
