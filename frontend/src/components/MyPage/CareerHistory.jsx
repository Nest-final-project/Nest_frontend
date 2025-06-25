import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Edit3, Trash2, Plus } from 'lucide-react';
import { careerAPI, profileAPI } from '../../services/api';
import CareerDetailModal from './CareerDetailModal';
import CareerEditModal from './CareerEditModal';
import './CareerHistory.css';

// 경력 아이템 표시 컴포넌트
const CareerItem = ({ career, onEdit, onDelete }) => (
  <div className="info-card">
    <div className="info-card-icon"><Briefcase /></div>
    <div className="info-card-content">
      <span className="info-card-label">{career.company}</span>
      <p className="info-card-value">
        {career.startAt?.slice(0, 10)} ~ {career.endAt ? career.endAt.slice(0, 10) : '재직중'}
      </p>
    </div>
    <div className="info-card-actions">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onEdit(career);
        }} 
        className="action-btn edit"
      >
        <Edit3 size={18} />
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(career.id);
        }} 
        className="action-btn delete"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
);

const CareerHistory = ({ userInfo }) => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [careerDetail, setCareerDetail] = useState(null);
  const [editModal, setEditModal] = useState({
    isOpen: false,
    career: null,
    isEditing: false
  });
  const fileInputRef = useRef(null);
  const [editingCertInfo, setEditingCertInfo] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');

  useEffect(() => {
    if (userInfo?.userRole === 'MENTOR') {
      fetchCareers();
    }
  }, [userInfo]);

  const fetchCareers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await careerAPI.getAllCareers();
      const rawCareers = response.data?.data?.content || [];
      setCareers(rawCareers);
    } catch (err) {
      setError("경력 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // 새로고침만 처리 (실제 저장은 CareerEditModal에서 처리)
    fetchCareers();
    closeEditModal();
    setSelectedProfileId('');
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        // await careerAPI.deleteCareer(id);
        fetchCareers();
      } catch (err) {
        console.error("경력 삭제 실패:", err);
      }
    }
  };

  // 상세보기 핸들러
  const handleCardClick = async (career) => {
    try {
      const res = await careerAPI.getCareerDetail(career.profileId, career.id);
      setCareerDetail(res.data.data);
    } catch (err) {
      alert('상세 정보를 불러오지 못했습니다.');
    }
  };

  // 수정 모달 열기
  const openEditModal = (career = null) => {
    setEditModal({
      isOpen: true,
      career,
      isEditing: !!career
    });
  };

  // 수정 모달 닫기
  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      career: null,
      isEditing: false
    });
    setSelectedProfileId('');
  };

  // 경력 수정 핸들러
  const handleEditCareer = (career) => {
    openEditModal(career);
  };

  // 모달에서 수정 버튼 클릭 시
  const handleEditFromModal = (career) => {
    setCareerDetail(null);
    openEditModal(career);
  };

  // 모달에서 삭제 버튼 클릭 시
  const handleDeleteFromModal = (career) => {
    if (window.confirm("정말 이 경력을 삭제하시겠습니까?")) {
      setCareerDetail(null); // 모달 닫기
      careerAPI.deleteCareer(career.id)
        .then(() => {
          alert("경력이 삭제되었습니다.");
          fetchCareers(); // 목록 새로고침
        })
        .catch(err => {
          console.error("경력 삭제 실패:", err);
          alert("경력 삭제에 실패했습니다.");
        });
    }
  };

  // 자격증 수정 버튼 클릭 시 파일 입력창 열기
  const handleEditCertificates = (career) => {
    setEditingCertInfo({
      careerId: career.id,
    });
    fileInputRef.current.click();
  };

  // 파일 선택 후 API 호출 (여러 파일)
  const handleFileSelected = async (event) => {
    const files = event.target.files;
    if (files && editingCertInfo) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      try {
        await careerAPI.updateCertificate(
          editingCertInfo.careerId,
          formData
        );
        alert('자격증이 성공적으로 수정되었습니다.');
        setCareerDetail(null);
        fetchCareers();
      } catch (err) {
        console.error("자격증 수정 실패:", err);
        alert("자격증 수정에 실패했습니다.");
      } finally {
        setEditingCertInfo(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  // 새 경력 추가 버튼 클릭 시 프로필 목록 조회
  const handleAddCareer = async () => {
    try {
      const res = await profileAPI.getMyProfile();
      // 응답 구조에 따라 data.data 또는 data.content 등으로 접근 필요
      const profileList = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.content || []);
      setProfiles(profileList);
      openEditModal();
    } catch (err) {
      alert('프로필 목록을 불러오지 못했습니다.');
    }
  };

  if (userInfo?.userRole !== 'MENTOR') return null;
  if (loading) return <div className="loading-spinner">로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="career-history-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        style={{ display: 'none' }}
        accept="image/*,.pdf"
        multiple
      />
      
      <h3>경력 목록</h3>
      
      <div className="career-list">
        {careers.map(career => (
          <div key={career.id} onClick={() => handleCardClick(career)} style={{ cursor: 'pointer' }}>
            <CareerItem 
              career={career} 
              onEdit={handleEditCareer}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
      
      <button onClick={handleAddCareer} className="add-career-btn">
        <Plus size={18} /> 새 경력 추가
      </button>

      {/* 경력 수정/추가 모달 */}
      <CareerEditModal
        career={editModal.career}
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        onSave={fetchCareers}
        profiles={profiles}
        selectedProfileId={selectedProfileId}
        setSelectedProfileId={setSelectedProfileId}
      />

      {/* 경력 상세보기 모달 */}
      {careerDetail && (
        <CareerDetailModal
          detail={careerDetail}
          onClose={() => setCareerDetail(null)}
          onEdit={() => handleEditFromModal(careerDetail)}
          onDelete={() => handleDeleteFromModal(careerDetail)}
          onEditCertificates={() => handleEditCertificates(careerDetail)}
        />
      )}
    </div>
  );
};

export default CareerHistory;
