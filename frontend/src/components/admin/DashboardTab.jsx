import React from 'react';
import {
  Users, MessageCircle, DollarSign, Activity, ArrowUp, ArrowDown,
  RefreshCw, Zap, ChevronRight, Briefcase, FileText, Tag, Ticket,
  AlertTriangle
} from 'lucide-react';

const DashboardTab = ({ 
  isDarkMode, 
  stats, 
  lastUpdate, 
  isRealTimeMode, 
  setIsRealTimeMode, 
  loading, 
  setLoading, 
  notifications, 
  setActiveTab 
}) => {
  const StatCard = ({ title, value, change, icon: Icon, color = 'blue', subtitle, isLive = false, trend = 'up' }) => (
    <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
      isDarkMode
        ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-xl'
        : 'bg-white/80 border-gray-200/50 backdrop-blur-xl'
    }`}>
      {isLive && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 animate-pulse"></div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${
            color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
            color === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
            color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            <Icon size={24} />
            {isLive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
            )}
          </div>

          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
            trend === 'up'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {change}%
          </div>
        </div>

        <div>
          <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </h3>
          <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, color, onClick }) => (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 hover:scale-[1.02] ${
        isDarkMode
          ? 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50'
          : 'bg-white/80 border border-gray-200/50 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
          color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
          color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
        <ChevronRight size={16} className={`transition-transform group-hover:translate-x-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`} />
      </div>
    </button>
  );

  const ActivityItem = ({ activity }) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
      isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
    } ${activity.urgent ? 'border-l-2 border-red-400' : ''}`}>
      <div className={`w-2 h-2 rounded-full mt-2 ${
        activity.type === 'success' ? 'bg-emerald-400' :
        activity.type === 'warning' ? 'bg-yellow-400' :
        activity.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
      } ${activity.urgent ? 'animate-pulse' : ''}`}></div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {activity.message}
        </p>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {activity.time}
        </p>
      </div>

      {activity.urgent && (
        <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            실시간 관리자 대시보드
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            플랫폼 현황을 실시간으로 모니터링하세요
            <span className="ml-2 text-sm">
              마지막 업데이트: {lastUpdate.toLocaleTimeString()}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRealTimeMode(!isRealTimeMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRealTimeMode
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-400 border border-gray-700'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            <Zap size={16} />
            실시간 모드
          </button>

          <button
            onClick={() => setLoading(true)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? '업데이트 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 사용자"
          value={stats.totalUsers}
          change={stats.weeklyGrowth}
          icon={Users}
          color="blue"
          subtitle={`오늘 신규: ${stats.todayNewUsers}명`}
        />
        <StatCard
          title="온라인 사용자"
          value={stats.onlineUsers}
          change={8.2}
          icon={Activity}
          color="green"
          isLive={true}
          subtitle="실시간 접속자"
        />
        <StatCard
          title="활성 채팅"
          value={stats.activeChats}
          change={15.7}
          icon={MessageCircle}
          color="purple"
          isLive={true}
          subtitle="진행 중인 세션"
        />
        <StatCard
          title="오늘 수익"
          value={`₩${Math.floor(stats.revenue * 0.1).toLocaleString()}`}
          change={stats.monthlyGrowth}
          icon={DollarSign}
          color="yellow"
          subtitle={`총 수익: ₩${stats.revenue.toLocaleString()}`}
        />
      </div>

      {/* 빠른 액션 */}
      <div className="space-y-4">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          빠른 작업
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={Briefcase}
            title="경력 관리"
            description="경력 정보를 관리하세요"
            color="blue"
            onClick={() => setActiveTab('careers')}
          />
          <QuickActionCard
            icon={FileText}
            title="민원 관리"
            description="사용자 문의를 처리하세요"
            color="yellow"
            onClick={() => setActiveTab('complaints')}
          />
          <QuickActionCard
            icon={Tag}
            title="카테고리 관리"
            description="서비스 카테고리를 관리하세요"
            color="emerald"
            onClick={() => setActiveTab('categories')}
          />
          <QuickActionCard
            icon={Ticket}
            title="이용권 관리"
            description="이용권을 관리하세요"
            color="red"
            onClick={() => setActiveTab('tickets')}
          />
        </div>
      </div>

      {/* 차트 및 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 차트 영역 */}
        <div className={`lg:col-span-2 rounded-2xl border p-6 ${
          isDarkMode
            ? 'bg-gray-800/50 border-gray-700/50'
            : 'bg-white/80 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              실시간 활동 현황
            </h3>
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>

          <div className="h-64 flex items-end justify-center gap-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm transition-all duration-1000"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                  width: '20px',
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* 활동 피드 */}
        <div className={`rounded-2xl border p-6 ${
          isDarkMode
            ? 'bg-gray-800/50 border-gray-700/50'
            : 'bg-white/80 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              실시간 활동
            </h3>
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>

          <div className="space-y-1">
            {notifications.map(notification => (
              <ActivityItem key={notification.id} activity={notification} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;