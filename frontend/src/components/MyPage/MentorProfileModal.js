import React, { useState, useEffect } from 'react';
import  {categoryAPI, keywordAPI} from '../../services/api';


const MentorProfileModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [keywordId, setKeywordId] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [keywords, setKeywords] = useState([]);

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      console.log('📂 카테고리 목록 가져오는 중...');
      const response = await categoryAPI.getCategories();
      const fetchedCategories = response.data.data.content;

      if (Array.isArray(fetchedCategories)) {
        setCategories(fetchedCategories);
        console.log('✅ 카테고리 목록 로딩 완료:', fetchedCategories.length, '개');
      } else {
        console.warn('⚠️ 카테고리 데이터가 배열이 아님:', fetchedCategories);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ 카테고리 로딩 실패:', error);
      setCategories([]);
      alert('카테고리 목록을 불러오는데 실패했습니다.');
    }
  };

  // 키워드 목록 가져오기
  const fetchKeywords = async () => {
    try {
      const response = await keywordAPI.getKeywords();
      const fetchedKeywords = response.data.data.content;

      if (Array.isArray(fetchedKeywords)) {
        setKeywords(fetchedKeywords);
      } else {
        setKeywords([]);
      }
    } catch (err) {
      setKeywords([]);
      alert("키워드 목록을 불러오는데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchKeywords();
  }, []);

  const handleKeywordChange = (e) => {
    const selectedKeywordId = Number(e.target.value);
    const isChecked = e.target.checked;

    setKeywordId(prev => {
      if (isChecked) {
        return prev.includes(selectedKeywordId) ? prev : [...prev, selectedKeywordId];
      } else {
        return prev.filter(id => id !== selectedKeywordId);
      }
    });
  };

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, introduction, imageUrl, keywordId, categoryId});
    onClose();
  };

  return (
      <div className="mentor-profile-modal-backdrop">
        <div className="mentor-profile-modal">
          <h2>멘토 프로필 등록</h2>
          <form onSubmit={handleSubmit}>
            <label>
              제목
              <input value={title} onChange={e => setTitle(e.target.value)} required />
            </label>
            <label>
              소개
              <textarea value={introduction} onChange={e => setIntroduction(e.target.value)} required />
            </label>
            <label>
              이미지 URL
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </label>
            {/* ⭐️ 계좌 번호 입력 필드 제거 */}
            <label>
              키워드
              <div>
                {keywords.length > 0 ? (
                    keywords.map(k => (
                        <label key={k.id} style={{ marginRight: 8 }}>
                          <input
                              type="checkbox"
                              value={k.id}
                              checked={keywordId.includes(Number(k.id))}
                              onChange={handleKeywordChange}
                          />
                          {k.name}
                        </label>
                    ))
                ) : (
                    <p>키워드를 불러오는 중이거나 없습니다.</p>
                )}
              </div>
            </label>
            <label>
              카테고리
              <select value={categoryId} onChange={handleCategoryChange} required>
                <option value="">선택</option>
                {categories.length > 0 ? (
                    categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                ) : (
                    <option disabled>카테고리를 불러오는 중이거나 없습니다.</option>
                )}
              </select>
            </label>
            <div className="modal-btns">
              <button type="button" onClick={onClose}>취소</button>
              <button type="submit">등록</button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default MentorProfileModal;
