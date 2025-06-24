import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Edit3, X, UserPlus } from 'lucide-react';
import { careerAPI } from '../../services/api';
import './CareerHistory.css';

const CareerHistory = ({ userInfo }) => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (userInfo?.userRole === 'MENTOR' && !dataLoaded) {
      fetchCareers();
    }
  }, [userInfo, dataLoaded]);

  const fetchCareers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await careerAPI.getAllCareers();
      const rawCareers = response.data.data.content;
      setCareers(rawCareers);
      setDataLoaded(true);
    } catch (err) {
      console.error("경력 내역을 불러오는 데 실패했습니다:", err);
      setError("경력 내역을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setDataLoaded(false);
    setError(null);
    fetchCareers();
  };

  // 멘토가 아닌 경우 렌더링하지 않음
  if (userInfo?.userRole !== 'MENTOR') {
    return null;
  }

  if (loading) {
    return (
      <div className="careers-tab">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>경력 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="careers-tab">
        <div className="error-state">
          <Briefcase className="error-icon" />
          <h4>오류가 발생했습니다</h4>
          <p>{error}</p>
          <button className="retry-btn" onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="careers-tab">
      <div className="section-header">
        <h3>경력 목록</h3>
        <p>멘토링에 표시될 경력 사항을 관리하세요</p>
      </div>

      {careers.length > 0 ? (
        <div className="careers-scroll-container">
          <div className="careers-container">
            {careers.map((career, index) => (
              <div key={career.id} className="career-card">
                <div className="career-number">{index + 1}</div>
                <div className="career-content">
                  <div className="career-header">
                    <div className="career-title-section">
                      <h4 className="career-company">{career.company}</h4>
                      <span className="career-position">{career.position || '직책'}</span>
                    </div>
                    {career.isCurrent && (
                      <span className="career-current-badge">재직중</span>
                    )}
                  </div>

                  <div className="career-details">
                    <div className="career-period">
                      <Calendar className="career-icon" size={16} />
                      <span className="career-date">
                        {career.startAt} ~ {career.endAt || '현재'}
                      </span>
                      {career.duration && (
                        <span className="career-duration">({career.duration})</span>
                      )}
                    </div>

                    {career.department && (
                      <div className="career-department">
                        <Briefcase className="career-icon" size={16} />
                        <span>{career.department}</span>
                      </div>
                    )}
                  </div>

                  {career.description && (
                    <div className="career-description-section">
                      <p className="career-description">{career.description}</p>
                    </div>
                  )}

                  {career.skills && career.skills.length > 0 && (
                    <div className="career-skills">
                      {career.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  )}

                  <div className="career-actions">
                    <button className="career-action-btn edit">
                      <Edit3 size={14} />
                      수정
                    </button>
                    <button className="career-action-btn delete">
                      <X size={14} />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="careers-footer">
            <button className="add-career-btn">
              <UserPlus size={18} />
              새 경력 추가
            </button>
          </div>

          <div className="scroll-guide">
            <span>더 많은 경력을 보려면 스크롤하세요</span>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <Briefcase className="empty-icon" />
          <h4>등록된 경력이 없습니다</h4>
          <p>경력을 추가하여 프로필을 완성해보세요!</p>
          <button className="empty-action-btn">
            <Briefcase size={18} />
            첫 경력 추가하기
          </button>
        </div>
      )}
    </div>
  );
};

export default CareerHistory;
