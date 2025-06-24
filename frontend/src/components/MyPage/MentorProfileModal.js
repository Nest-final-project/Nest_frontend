import React, { useState } from 'react';

const dummyKeywords = [
  { id: 1, name: 'JavaScript' },
  { id: 2, name: 'React' },
  { id: 3, name: 'Node.js' },
];
const dummyCategories = [
  { id: 1, name: '개발' },
  { id: 2, name: '디자인' },
];

const MentorProfileModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [keywordId, setKeywordId] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleKeywordChange = (id) => {
    setKeywordId(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, introduction, imageUrl, keywordId, categoryId, accountNumber });
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
          <label>
            키워드
            <div>
              {dummyKeywords.map(k => (
                <label key={k.id} style={{ marginRight: 8 }}>
                  <input
                    type="checkbox"
                    checked={keywordId.includes(k.id)}
                    onChange={() => handleKeywordChange(k.id)}
                  />
                  {k.name}
                </label>
              ))}
            </div>
          </label>
          <label>
            카테고리
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
              <option value="">선택</option>
              {dummyCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            계좌번호
            <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required />
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