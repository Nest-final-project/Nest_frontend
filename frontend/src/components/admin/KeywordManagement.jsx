import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Hash, RefreshCw } from 'lucide-react';
import './AdminCommon.css';
import { keywordAPI, adminAPI } from "../../services/api.js";
import { accessTokenUtils } from "../../utils/tokenUtils.js";
import KeywordFormModal from './KeywordFormModal.jsx';

const KeywordManagement = ({ isDarkMode }) => {
  console.log('🚀 KeywordManagement 컴포넌트 렌더링 시작');
  
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  
  console.log('📊 현재 상태:', { keywords: keywords.length, loading, showCreateModal });

  useEffect(() => {
    // 인증 토큰 확인
    const token = accessTokenUtils.getAccessToken();
    
    if (!token) {
      console.warn('⚠️ 인증 토큰이 없습니다. 로그인이 필요합니다.');
      alert('관리자 로그인이 필요합니다.');
      setKeywords([]);
      return;
    }
    
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    setLoading(true);
    try {
      console.log('🔍 키워드 API 호출 시작');
      const response = await keywordAPI.getKeywords();
      console.log('📋 키워드 API 응답:', response);
      
      // 응답 데이터 구조 분석 및 파싱
      let keywordData = [];
      if (response.data) {
        console.log('📋 응답 데이터 구조:', JSON.stringify(response.data, null, 2));
        
        if (Array.isArray(response.data)) {
          keywordData = response.data;
          console.log('✅ 직접 배열 형태');
        } else if (response.data.data && response.data.data.content && Array.isArray(response.data.data.content)) {
          keywordData = response.data.data.content;
          console.log('✅ response.data.data.content 경로 사용');
        } else if (response.data.data && Array.isArray(response.data.data)) {
          keywordData = response.data.data;
          console.log('✅ response.data.data 경로 사용');
        } else if (response.data.content && Array.isArray(response.data.content)) {
          keywordData = response.data.content;
          console.log('✅ response.data.content 경로 사용');
        } else {
          console.warn('⚠️ 알 수 없는 응답 구조, 빈 배열 반환');
          keywordData = [];
        }
      }
      
      console.log('📊 파싱된 키워드 데이터:', keywordData);
      setKeywords(keywordData);
      
    } catch (error) {
      console.error('❌ 키워드 목록 조회 실패:', error);
      
      setKeywords([]);
      
      let errorMessage = '키워드 목록을 불러오는데 실패했습니다.';
      
      if (error.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (error.response?.status === 403) {
        errorMessage = '키워드 관리 권한이 없습니다.';
      } else if (error.response?.status === 404) {
        errorMessage = '키워드 API를 찾을 수 없습니다.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(`오류: ${errorMessage}`);
      
    } finally {
      setLoading(false);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSaveKeyword = async (keywordData) => {
    setSaving(true);
    try {
      if (keywordData.id) {
        console.log(`📝 키워드 수정 시작: ID ${keywordData.id}`, keywordData);
        await adminAPI.updateKeyword(keywordData.id, keywordData);
        console.log('✅ 키워드 수정 성공');
        alert('키워드가 성공적으로 수정되었습니다.');
      } else {
        console.log('🆕 새 키워드 등록 시작:', keywordData);
        await adminAPI.createKeyword(keywordData);
        console.log('✅ 키워드 등록 성공');
        alert('키워드가 성공적으로 등록되었습니다.');
      }
      
      setShowCreateModal(false);
      setSelectedKeyword(null);
      await loadKeywords(); // 목록 새로고침
    } catch (error) {
      console.error('❌ 키워드 저장 실패:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          '키워드 저장에 실패했습니다.';
      alert(`저장 실패: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (keyword) => {
    setSelectedKeyword(keyword);
    setShowCreateModal(true);
  };

  const handleDelete = async (keywordId) => {
    if (window.confirm('정말로 이 키워드를 삭제하시겠습니까?')) {
      try {
        console.log(`🗑️ 키워드 삭제 시작: ID ${keywordId}`);
        await adminAPI.deleteKeyword(keywordId);
        console.log('✅ 키워드 삭제 성공');
        
        setKeywords(keywords.filter(keyword => keyword.id !== keywordId));
        alert('키워드가 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('❌ 키워드 삭제 실패:', error);
        alert('키워드 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  console.log('🎨 KeywordManagement 렌더링:', { 
    컴포넌트상태: 'rendering',
    키워드개수: keywords.length,
    로딩상태: loading,
    모달상태: showCreateModal 
  });

  return (
    <div className={isDarkMode ? 'dark-mode' : ''}>
      <div className="content-header">
        <div className="header-left">
          <h2 className="keyword-title">
            <Hash size={28} />
            키워드 관리
          </h2>
          <p>멘토링 키워드를 생성하고 관리합니다</p>
        </div>
        <div className="header-actions">
          <button 
            className="coffee-btn coffee-btn-primary"
            onClick={() => {
              console.log('🔘 키워드 추가 버튼 클릭됨');
              setSelectedKeyword(null);
              setShowCreateModal(true);
            }}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            키워드 추가
          </button>
        </div>
      </div>

      <div className="content-table keyword-table">
        <div className="table-header">
          <div className="table-cell">키워드</div>
          <div className="table-cell">작업</div>
        </div>

        {(() => {
          if (loading) {
            return (
              <div className="loading-state">
                <Hash className="spinning" size={24} />
                <p>키워드 데이터를 불러오는 중...</p>
              </div>
            );
          } else if (keywords.length === 0) {
            return (
              <div className="empty-state">
                <Hash size={48} />
                <h3>키워드가 없습니다</h3>
                <p>새로운 키워드를 추가해보세요</p>
              </div>
            );
          } else {
            return keywords.map((keyword) => (
            <div key={keyword.id} className="table-row">
              <div className="table-cell">
                <div className="cell-content">
                  <Hash size={16} />
                  <div>
                    <strong>{keyword.name || '이름 없음'}</strong>
                  </div>
                </div>
              </div>
              <div className="table-cell">
                <div className="table-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(keyword)}
                    title="수정"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(keyword.id)}
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
          <KeywordFormModal
              keyword={selectedKeyword}
              onSave={handleSaveKeyword}
              onClose={() => setShowCreateModal(false)}
              saving={saving}
          />
      )}
    </div>
  );
};

export default KeywordManagement;