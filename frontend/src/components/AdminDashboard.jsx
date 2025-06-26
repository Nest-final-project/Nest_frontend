import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Users, MessageCircle, CreditCard, Settings,
  BarChart3, Shield, Bell, Search, Filter, Calendar,
  Download, RefreshCw, TrendingUp, Activity, DollarSign,
  UserCheck, AlertTriangle, Eye, Edit3, Trash2,
  Plus, X, Check, Zap, Target, Clock, Briefcase,
  FileText, Tag, Hash, Ticket, Gift, Menu, Sun, Moon,
  Globe, Cpu, Database, Wifi, Star, Award, Flame,
  ArrowUp, ArrowDown, MoreHorizontal, ChevronRight
} from 'lucide-react';

const AdminDashboard = ({ onBack, userInfo }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [stats, setStats] = useState({
    totalUsers: 1255,
    activeMentors: 168,
    totalSessions: 20,
    revenue: 9073,
    weeklyGrowth: 12.5,
    monthlyGrowth: 28.3,
    todayNewUsers: 28,
    onlineUsers: 156,
    pendingApprovals: 7,
    activeChats: 34
  });

  const [notifications, setNotifications] = useState([
    { id: 1, message: '새로운 멘토 승인 요청 3건', type: 'warning', time: '2분 전', urgent: true },
    { id: 2, message: '시스템 업데이트 완료', type: 'success', time: '1시간 전', urgent: false },
    { id: 3, message: '결제 오류 신고 1건', type: 'error', time: '3시간 전', urgent: true },
    { id: 4, message: '월간 수익 목표 90% 달성', type: 'success', time: '4시간 전', urgent: false }
  ]);

  // 실시간 데이터 업데이트
  useEffect(() => {
    if (!isRealTimeMode) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        onlineUsers: Math.max(100, prev.onlineUsers + Math.floor(Math.random() * 21) - 10),
        activeChats: Math.max(20, prev.activeChats + Math.floor(Math.random() * 7) - 3),
        totalSessions: prev.totalSessions + Math.floor(Math.random() * 2)
      }));
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, [isRealTimeMode]);

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3, badge: null },
    { id: 'payments', label: '결제 관리', icon: CreditCard, badge: null },
    { type: 'divider' },
    { id: 'careers', label: '경력 관리', icon: Briefcase, badge: null },
    { id: 'complaints', label: '민원 관리', icon: FileText, badge: null },
    { id: 'categories', label: '카테고리 관리', icon: Tag, badge: null },
    { id: 'keywords', label: '키워드 관리', icon: Hash, badge: null },
    { id: 'tickets', label: '이용권 관리', icon: Ticket, badge: null },
    { id: 'coupons', label: '쿠폰 관리', icon: Gift, badge: null }
  ];

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

  const renderDashboard = () => (
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      default:
        return (
            <div className={`rounded-2xl border p-8 text-center ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'
            }`}>
              <Briefcase size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                개발 중
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                해당 페이지는 개발 중입니다...
              </p>
            </div>
        );
    }
  };

  return (
      <div className={`min-h-screen transition-colors duration-300 ${
          isDarkMode
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
              : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        {/* 사이드바 */}
        <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-72'
        } ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-xl border-r ${
            isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>

          {/* 사이드바 헤더 */}
          <div className="flex items-center justify-between p-6">
            {!sidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <button
                      onClick={onBack}
                      className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Shield size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {userInfo?.name || '관리자'}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Administrator
                      </p>
                    </div>
                  </div>
                </div>
            )}

            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="px-3 pb-6">
            <div className="space-y-1">
              {menuItems.map((item, index) => {
                if (item.type === 'divider') {
                  return (
                      <div
                          key={index}
                          className={`my-4 h-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
                      />
                  );
                }

                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                            isActive
                                ? isDarkMode
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-50 text-blue-600'
                                : isDarkMode
                                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                      )}

                      <Icon size={20} className="flex-shrink-0" />

                      {!sidebarCollapsed && (
                          <>
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                          {item.badge}
                        </span>
                            )}
                          </>
                      )}

                      {sidebarCollapsed && item.badge && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                      )}
                    </button>
                );
              })}
            </div>
          </nav>

          {/* 사이드바 푸터 */}
          {!sidebarCollapsed && (
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
                }`}>
                  <Bell size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                알림 {notifications.length}개
              </span>
                </div>
              </div>
          )}
        </div>

        {/* 메인 콘텐츠 */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-72'}`}>
          {/* 상단 바 */}
          <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
              isDarkMode
                  ? 'bg-gray-900/80 border-gray-800'
                  : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center justify-between px-8 py-4">
              <div className="flex items-center gap-4">
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  MentorConnect 관리자
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* 다크모드 토글 */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* 로그아웃 버튼 */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                >
                  <ChevronLeft size={16} />
                  로그아웃
                </button>
              </div>
            </div>
          </header>

          {/* 콘텐츠 영역 */}
          <main className="p-8">
            {renderContent()}
          </main>
        </div>
      </div>
  );
};

export default AdminDashboard;
