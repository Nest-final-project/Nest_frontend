import React from 'react';
import { Gift, Percent, Calendar, Users } from 'lucide-react';

const CouponsTab = ({ isDarkMode }) => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          쿠폰 관리
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          할인 쿠폰을 생성하고 관리하세요
        </p>
      </div>

      <div className={`rounded-2xl border p-8 text-center ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'
      }`}>
        <Gift size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          쿠폰 관리 시스템
        </h3>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          쿠폰 생성, 할인율 설정, 사용 내역 관리 기능이 여기에 구현됩니다.
        </p>
      </div>
    </div>
  );
};

export default CouponsTab;