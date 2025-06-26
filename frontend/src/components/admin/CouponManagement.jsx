import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Download, RefreshCw, Gift, Calendar, Percent, Users } from 'lucide-react';
import './AdminCommon.css';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [mockCoupons] = useState([
    {
      id: 1,
      name: '신규가입 환영 쿠폰',
      code: 'WELCOME2024',
      discountType: 'percent',
      discountValue: 20,
      minAmount: 10000,
      usageLimit: 1000,
      usedCount: 234,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true
    },
    {
      id: 2,
      name: '여름 특가 쿠폰',
      code: 'SUMMER50',
      discountType: 'fixed',
      discountValue: 5000,
      minAmount: 30000,
      usageLimit: 500,
      usedCount: 156,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      isActive: true
    }
  ]);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    setTimeout(() => {
      setCoupons(mockCoupons);
      setLoading(false);
    }, 1000);
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && coupon.isActive) ||
                         (filterType === 'inactive' && !coupon.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setShowCreateModal(true);
  };

  const handleDelete = (couponId) => {
    if (window.confirm('정말로 이 쿠폰을 삭제하시겠습니까?')) {
      setCoupons(coupons.filter(coupon => coupon.id !== couponId));
    }
  };

  const formatDiscount = (type, value) => {
    return type === 'percent' ? `${value}%` : `₩${value.toLocaleString()}`;
  };

  return (
    <div className="admin-content-wrapper">
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
            className="btn-primary"
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

      <div className="content-filters">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="쿠폰명, 코드로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="all">전체</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
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
                    <strong>{coupon.name}</strong>
                    <small>코드: {coupon.code}</small>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Percent size={16} />
                  <div>
                    <div>{formatDiscount(coupon.discountType, coupon.discountValue)}</div>
                    <small>최소 ₩{coupon.minAmount.toLocaleString()}</small>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Users size={16} />
                  <div>
                    <div>{coupon.usedCount} / {coupon.usageLimit}</div>
                    <div className="usage-bar">
                      <div 
                        className="usage-fill"
                        style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <div className="cell-content">
                  <Calendar size={16} />
                  <div>
                    <div>{coupon.startDate}</div>
                    <small>~ {coupon.endDate}</small>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <span className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                  {coupon.isActive ? '활성' : '비활성'}
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
      </div>
    </div>
  );
};

export default CouponManagement;
