import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Edit3, X, Plus, Save, RotateCcw } from 'lucide-react';
import { careerAPI, profileAPI } from '../../services/api';
import CareerDetailModal from './CareerDetailModal';
import './CareerHistory.css';

// 경력 아이템 표시 컴포넌트 (직책, 수정/삭제 버튼 제거)
const CareerItem = ({ career }) => (
  <div className="info-card">
    <div className="info-card-icon"><Briefcase /></div>
    <div className="info-card-content">
      <span className="info-card-label">{career.company}</span>
      <p className="info-card-value">
        {career.startAt?.slice(0, 10)} ~ {career.endAt ? career.endAt.slice(0, 10) : '재직중'}
      </p>
    </div>
  </div>
);

// 경력 수정/추가 폼 컴포넌트
const CareerForm = ({ career, onSave, onCancel, profiles, selectedProfileId, setSelectedProfileId }) => {
  const [formData, setFormData] = useState({
    company: career?.company || '',
    startAt: career?.startAt?.slice(0, 10) || '',
    endAt: career?.endAt?.slice(0, 10) || '',
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...career, ...formData }, file);
  };

  return (
    <form onSubmit={handleSubmit} className="info-card form-card">
      {profiles && profiles.length > 0 && !career?.id && (
        <select value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)} required>
          <option value="">프로필을 선택하세요</option>
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>{profile.title || profile.name || `프로필 ${profile.id}`}</option>
          ))}
        </select>
      )}
      <input name="company" value={formData.company} onChange={handleChange} placeholder="회사명" required />
      <input type="file" onChange={handleFileChange} />
      <input type="date" name="startAt" value={formData.startAt} onChange={handleChange} required />
      <input type="date" name="endAt" value={formData.endAt} onChange={handleChange} placeholder="종료일 (없으면 현재)" />
      <div className="info-card-actions">
        <button type="submit" className="action-btn save"><Save size={18} /></button>
        <button type="button" onClick={onCancel} className="action-btn cancel"><RotateCcw size={18} /></button>
      </div>
    </form>
  );
};

const CareerHistory = ({ userInfo }) => {
  const [careers, setCareers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [careerDetail, setCareerDetail] = useState(null);
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

  const handleSave = async (careerData, file) => {
    const formData = new FormData();
    formData.append('dto', new Blob([JSON.stringify({
      company: careerData.company,
      startAt: careerData.startAt ? careerData.startAt + 'T00:00:00' : null,
      endAt: careerData.endAt ? careerData.endAt + 'T00:00:00' : null,
    })], { type: 'application/json' }));

    if (file) {
      formData.append('files', file);
    }
    try {
      if (careerData.id) {
        // 수정 API 호출 (FormData 사용)
        // await careerAPI.updateCareer(careerData.id, formData);
      } else {
        if (!selectedProfileId) {
          alert('프로필을 선택하세요.');
          return;
        }
        await careerAPI.createCareer(selectedProfileId, formData);
      }
      fetchCareers();
      setEditingId(null);
      setIsAdding(false);
      setSelectedProfileId('');
    } catch (err) {
      console.error("경력 저장 실패:", err);
    }
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
    if (editingId === career.id) return; // 수정 중일 때는 상세 안 띄움
    try {
      const res = await careerAPI.getCareerDetail(career.profileId, career.id);
      setCareerDetail(res.data.data);
    } catch (err) {
      alert('상세 정보를 불러오지 못했습니다.');
    }
  };

  // 모달에서 수정 버튼 클릭 시
  const handleEditFromModal = (career) => {
    setCareerDetail(null);
    setEditingId(career.id);
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
      setIsAdding(true);
    } catch (err) {
      alert('프로필 목록을 불러오지 못했습니다.');
    }
  };

  if (userInfo?.userRole !== 'MENTOR') return null;
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

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
          editingId === career.id
            ? <CareerForm key={career.id} career={career} onSave={handleSave} onCancel={() => setEditingId(null)} profiles={profiles} selectedProfileId={selectedProfileId} setSelectedProfileId={setSelectedProfileId} />
            : <div key={career.id} onClick={() => handleCardClick(career)} style={{ cursor: 'pointer' }}>
                <CareerItem career={career} />
              </div>
        ))}
        {isAdding && (
          <CareerForm onSave={handleSave} onCancel={() => setIsAdding(false)} profiles={profiles} selectedProfileId={selectedProfileId} setSelectedProfileId={setSelectedProfileId} />
        )}
      </div>
      {!isAdding && (
        <button onClick={handleAddCareer} className="add-career-btn">
          <Plus size={18} /> 새 경력 추가
        </button>
      )}
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
