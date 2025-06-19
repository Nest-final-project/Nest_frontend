import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'; // 필요한 아이콘만 임포트하는 것이 좋습니다.
import './MentorProfile.css';
import {profileAPI} from "../services/api"

const MentorProfile = ({ mentor, onBack, onBooking }) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(''); // 현재 코드에서는 사용되지 않지만, 더미 데이터와 연결되어 있습니다.
  const [showCareer, setShowCareer] = useState(false);
  const [showServices, setShowServices] = useState(false); // 현재 코드에서는 사용되지 않지만, 더미 데이터와 연결되어 있습니다.

  // 더미 데이터 - 실제로는 props나 API에서 받아올 데이터
  const mentorDetails = {
    ...mentor,
    profileImage: mentor.avatar, // mentor.avatar가 텍스트인지 이미지 URL인지에 따라 img 태그 사용 여부가 결정됩니다.
    introduction: `초기 스타트업부터 네카라쿠배까지 모바일 개발로 시작해서 백엔드까지\n\n다양한 경험과 일년에도 수십건 이상의 번역 경험을 가진 현직 번역관입니다.\n\n다양한 실제 사례를 접하며 같은 경험의 기획이 주어졌다라도 어떻게 대응하고 해석해야 자신만의 강점이 되고 진정한 경험이 될지에 대해 잘 이해하고 있습니다.`,
    hashtags: ['네카라쿠배', '현직15년'],
    career: [
      {
        company: '주식회사 아이큐브',
        position: '솔루션기업',
        period: '2010.01 - 2013.03',
        description: '네트워크신뢰성립'
      },
      {
        company: '쿠팡 주식회사',
        position: '외국계',
        period: '2017.01 - 2019.06',
        description: '쇼핑몰윤플랫폼'
      },
      {
        company: '(주)아볼자',
        position: '솔루션기업',
        period: '2019.06 - 2022.10',
        description: '호텔여행창업'
      },
      {
        company: '주식회사 온톤체어',
        position: '스타트업(SERIES_C)',
        period: '2013.03 - 2016.12',
        description: '기타서비스업'
      }
    ],
    currentPosition: '합격을 부르는 개발자 인터뷰',
    serviceIntro: '현직 면접관이 알려드리는',
    servicePoints: [
      '개발자 면접 해야할 것 / 하지 말아야할 것',
      '다음 면접을 부르는 체크잇털',
      '연차별 면접의 키 포인트'
    ],
    services: [
      {
        title: '모의면접',
        duration: ['40분', '50분', '60분'],
        description: '모의 + 실시간 피드백 + 한국 피드백 포함',
        detail: '실전 면접을 연습하고 개선점을 파악해 볼 수 있어요!',
        price: '29,900원 ~',
        popular: true
      },
      {
        title: '커피챗',
        duration: ['20분', '30분', '40분'],
        description: '전문가의 리뷰로 커리어의 완성도를 높여보세요!',
        detail: '',
        price: '16,900원 ~'
      },
      {
        title: '이력서 리뷰',
        duration: ['30분', '40분', '50분'],
        description: '전문가의 리뷰로 성공적인 이력서를 완성해 보세요!',
        detail: '',
        price: '24,900원 ~'
      },
      {
        title: '포트폴리오 리뷰',
        duration: ['30분', '40분', '50분'],
        description: '전문가의 리뷰로 포트폴리오의 완성도를 높여보세요!',
        detail: '',
        price: '24,900원 ~'
      }
    ]
  };

  // 이 함수는 현재 UI에서 호출되지 않지만, 더미 데이터와 함께 제공되었습니다.
  const handleBookSession = () => {
    if (selectedTimeSlot) {
      alert(`${mentorDetails.name || '멘토'}님과의 세션이 예약되었습니다!\n일시: ${selectedTimeSlot}`);
    } else {
      alert('세션 시간을 선택해주세요.');
    }
  };

  return (
      <div className="mentor-profile-container">
        <div className="profile-header">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft className="icon" />
          </button>
          <div className="header-category">
            IT개발·데이터 › 전체
          </div>
        </div>

        <div className="profile-content">
          {/* 프로필 헤로 섹션 */}
          <div className="profile-hero">
            <div className={`profile-avatar gradient-bg-${mentor.id}`}>
              {/* mentor.avatar가 텍스트("ab" 등)인 경우 아래와 같이 그대로 둡니다. */}
              {mentor.avatar}
              {/* 만약 mentor.avatar가 이미지 URL이라면 아래와 같이 <img> 태그를 사용해야 합니다.
            <img src={mentor.avatar} alt="멘토 프로필" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            이 경우 profile-avatar의 CSS background 속성은 제거하거나 조정해야 합니다. */}
            </div>
            <div className="profile-info">
              <div className="mentor-username">abraxas</div>
              <h1 className="profile-title">{mentorDetails.currentPosition}</h1>

              <div className="hashtags">
                {mentorDetails.hashtags.map((tag, index) => (
                    <span key={index} className="hashtag">#{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 멘토 소개 섹션 */}
          <div className="content-section intro-section">
            <h2 className="section-title">멘토 소개</h2>
            <div className="intro-content">
              {mentorDetails.introduction.split('\n').map((line, index) => (
                  <p key={index} className="intro-paragraph">{line}</p>
              ))}
            </div>
          </div>

          {/* 경력사항 섹션 */}
          <div className="content-section career-section">
            <button
                className="section-toggle"
                onClick={() => setShowCareer(!showCareer)}
            >
              <span className="toggle-title">경력사항</span>
              {showCareer ? <ChevronUp className="toggle-icon" /> : <ChevronDown className="toggle-icon" />}
            </button>

            {showCareer && (
                <div className="career-content">
                  <div className="career-table">
                    {/* 데스크톱에서만 보이는 헤더 */}
                    <div className="career-header">
                      <div className="career-col">회사명</div>
                      <div className="career-col">회사규모</div>
                      <div className="career-col">근무기간</div>
                      <div className="career-col">회사의 업계</div>
                    </div>
                    {mentorDetails.career.map((item, index) => (
                        <div key={index} className="career-row">
                          {/* 모바일에서 data-label을 사용하여 헤더 역할을 합니다. */}
                          <div className="career-col company-name" data-label="회사명">{item.company}</div>
                          <div className="career-col" data-label="회사규모">{item.position}</div>
                          <div className="career-col" data-label="근무기간">{item.period}</div>
                          <div className="career-col" data-label="회사의 업계">{item.description}</div>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* 서비스 소개 섹션 */}
          <div className="content-section services-section">
            <h2 className="section-title">서비스 소개</h2>
            <div className="service-intro">
              <p className="service-intro-text">{mentorDetails.serviceIntro}</p>
              <div className="service-points">
                {mentorDetails.servicePoints.map((point, index) => (
                    <div key={index} className="service-point">
                      <span className="point-marker">★</span>
                      <span>{point}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* 서비스 항목 섹션 */}
          <div className="content-section service-items-section">
            <h2 className="section-title">서비스 항목</h2>
            <div className="services-grid">
              {mentorDetails.services.map((service, index) => (
                  <div key={index} className={`service-card ${service.popular ? 'popular' : ''}`}>
                    <div className="service-header">
                      <h4 className="service-name">{service.title}</h4>
                      <div className="service-duration">
                        {service.duration.map((duration, idx) => (
                            <span key={idx} className="duration-tag">{duration}</span>
                        ))}
                      </div>
                    </div>
                    <p className="service-description">{service.description}</p>
                    {service.detail && (
                        <p className="service-detail">{service.detail}</p>
                    )}
                    <div className="service-price">{service.price}</div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* 고정 하단 버튼 */}
        <div className="fixed-bottom">
          <button className="contact-button" onClick={onBooking}>
            신청하기
          </button>
        </div>
      </div>
  );
};

export default MentorProfile;
