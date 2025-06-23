import MentorProfile from '../components/MentorProfile';
import Booking from '../components/Booking';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { profileAPI } from "../services/api"; // 실제 API 호출 함수 경로로 수정

const MentorProfilePage = () => {
  const { userId, profileId } = useParams();
  console.log("url params:", userId, profileId);
  const [mentor, setMentor] = useState(null);
  const [bookingMode, setBookingMode] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const handleBookingClick = ({ mentor }) => {
    setSelectedMentor(mentor);
    setBookingMode(true);
  };

  useEffect(() => {
    profileAPI.getMentorDetail(userId, profileId)
    .then((res) => {
      console.log("🧩 mentor data:", res);
      setMentor(res.data);  // 또는 res.data.data 구조에 따라 다름
    })
    .catch((error) => {
      console.error('멘토 정보 가져오기 실패:', error);
    });
  }, [userId, profileId]);

  if (!mentor) return <div>로딩 중...</div>;

  return (
      <>
        {bookingMode ? (
            <Booking
                mentor={selectedMentor}
                onBack={() => window.history.back()}
                onCancel={() => setBookingMode(false)}
                onBooking={handleBooking}
            />
        ) : (
            <MentorProfile
                mentor={mentor.data}
                onBack={() => window.history.back()}
                onBooking={handleBookingClick}
            />
        )}
      </>
  );
};

export default MentorProfilePage;
