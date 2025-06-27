import React from 'react';
import CareerManagement from './CareerManagement';

// 관리자 탭에서 경력관리 기능만 출력
const CareersTab = ({ isDarkMode }) => {
  return (
      <div className="admin-tab-wrapper" style={{ background: isDarkMode ? "#18181b" : "#fff" }}>
        <CareerManagement />
      </div>
  );
};

export default CareersTab;
