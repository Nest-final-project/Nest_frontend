import React from 'react';
import ComplaintManagement from './ComplaintManagement';

const ComplaintsTab = ({ isDarkMode }) => {
  return (
    <div className="admin-tab-content">
      <ComplaintManagement />
    </div>
  );
};

export default ComplaintsTab;