import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Download, RefreshCw, Gift, Calendar, Percent, Users } from 'lucide-react';
import './AdminCommon.css';
import {adminAPI} from "../../services/api.js";
import {accessTokenUtils} from "../../utils/tokenUtils.js";
import CouponFormModal from './CouponFormModal.jsx';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
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
    
    // 개발용 임시 데이터 (실제 API 호출 전 UI 테스트용)
    const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';
    
    if (isDevelopment && false) { // 임시로 비활성화, 필요시 true로 변경
      console.log('🧪 개발 모드: 임시 더미 데이터 사용');
      setCoupons([
        {
          id: 1,
          name: '신규 가입 할인',
          code: 'WELCOME2024',
          discountType: 'percent',
          discountValue: 15,
          minAmount: 10000,
          usageLimit: 1000,
          usedCount: 157,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true
        },
        {
          id: 2,
          name: '여름 특가 할인',
          code: 'SUMMER50',
          discountType: 'amount',
          discountValue: 5000,
          minAmount: 30000,
          usageLimit: 500,
          usedCount: 89,
          startDate: '2024-06-01',
          endDate: '2024-08-31',
          isActive: true
        },
        {
          id: 3,
          name: '만료된 쿠폰',
          code: 'EXPIRED',
          discountType: 'percent',
          discountValue: 20,
          minAmount: 20000,
          usageLimit: 100,
          usedCount: 100,
          startDate: '2024-01-01',
          endDate: '2024-05-31',
          isActive: false
        }
      ]);
      return;
    }
    
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      console.log('🔍 쿠폰 목록 조회 시작...');
      const response = await adminAPI.findCoupons();
      console.log('✅ 쿠폰 목록 조회 성공:', response);
      console.log('📋 응답 데이터 구조:', JSON.stringify(response.data, null, 2));
      
      // 응답 데이터 구조를 더 자세히 분석
      let couponData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          couponData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          couponData = response.data.data;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          // 페이징된 응답의 경우
          couponData = response.data.content;
        } else {
          console.warn('⚠️ 예상하지 못한 응답 구조:', response.data);
          couponData = [];
        }
      }
      
      console.log('📊 파싱된 쿠폰 데이터:', couponData);
      console.log('📊 쿠폰 개수:', couponData.length);
      setCoupons(couponData);
    } catch (error) {
      console.error('❌ 쿠폰 목록 조회 실패:', error);
      console.error('❌ 에러 응답:', error.response?.data);
      console.error('❌ 에러 상태:', error.response?.status);
      
      // 에러 발생 시 빈 배열로 설정
      setCoupons([]);
      
      // 구체적인 에러 메시지 표시
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          '쿠폰 목록을 불러오는데 실패했습니다.';
      alert(`오류: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    // 안전한 문자열 검색 (null/undefined 체크)
    const couponName = coupon.name || coupon.couponName || '';
    const couponCode = coupon.code || coupon.couponCode || '';
    
    const matchesSearch = couponName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         couponCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 활성 상태 체크 (다양한 필드명 지원)
    const isActive = coupon.isActive ?? coupon.active ?? true;
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && isActive) ||
                         (filterType === 'inactive' && !isActive);
    return matchesSearch && matchesFilter;
  });

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
    <div className="admin-content-wrapper">
      {/* 개발자 디버그 정보 */}
      {import.meta.env.VITE_NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          쿠폰 개수: {coupons.length} | 로딩: {loading.toString()}
        </div>
      )}
      
      <div className="content-header">
        <div className="header-left">
          <h2>
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
          <button className="btn-secondary">
            <Download size={18} />
            내보내기
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


      <div className="content-table">
        <div className="table-header">
          <div className="table-cell">쿠폰 정보</div>
          <div className="table-cell">할인</div>
          <div className="table-cell">사용률</div>
          <div className="table-cell">기간</div>
          <div className="table-cell">상태</div>
          <div className="table-cell">작업</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={24} />
            <p>쿠폰 데이터를 불러오는 중...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="empty-state">
            <Gift size={48} />
            <h3>쿠폰이 없습니다</h3>
            <p>새로운 쿠폰을 추가해보세요</p>
          </div>
        ) : (
          filteredCoupons.map((coupon) => (
            <div key={coupon.id} className="table-row">
              <div className="table-cell">
                <div className="cell-content">
                  <Gift size={16} />
                  <div>
                    <strong>{coupon.name || coupon.couponName || '이름 없음'}</strong>
                    <small>코드: {coupon.code || coupon.couponCode || '코드 없음'}</small>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Percent size={16} />
                  <div>
                    <div>{formatDiscount(
                      coupon.discountType || 'percent', 
                      coupon.discountValue || 0
                    )}</div>
                    <small>최소 ₩{(coupon.minAmount || 0).toLocaleString()}</small>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Users size={16} />
                  <div>
                    <div>{coupon.usedCount || 0} / {coupon.usageLimit || 0}</div>
                    <div className="usage-bar">
                      <div 
                        className="usage-fill"
                        style={{ 
                          width: `${((coupon.usedCount || 0) / (coupon.usageLimit || 1)) * 100}%` 
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
                    <div>{coupon.startDate || '시작일 없음'}</div>
                    <small>~ {coupon.endDate || '종료일 없음'}</small>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <span className={`status-badge ${(coupon.isActive ?? coupon.active ?? true) ? 'active' : 'inactive'}`}>
                  {(coupon.isActive ?? coupon.active ?? true) ? '활성' : '비활성'}
                </span>
              </div>
              <div className="table-cell">
                <div className="table-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(coupon)}
                    title="수정"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(coupon.id)}
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div> {/* content-table를 감싸는 마지막 div */}

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
