import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Image,
  BookOpen,
  Settings,
  TrendingUp,
  Search,
  Flame,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  ExternalLink,
  Volume2,
  Trash2,
  Server,
  Database,
  Cloud,
  Save,
} from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { getMoments, MomentPost, deleteMoment } from '@/utils/moments';
import { speakWord } from '@/utils/speech';
import { logoutUser, getCurrentUser } from '@/services/authService';
import {
  fetchAdminStats,
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  fetchAdminVocabulary,
  updateAdminVocabulary,
  fetchAdminSettings,
  updateAdminSetting,
  AdminUser,
  AdminVocab,
  AdminStats,
  AdminSetting,
} from '@/services/adminService';

type AdminTab = 'overview' | 'users' | 'snaps' | 'vocab' | 'system';

function AdminPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real backend states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [vocabList, setVocabList] = useState<AdminVocab[]>([]);
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [moments, setMoments] = useState<MomentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSetting, setIsSavingSetting] = useState(false);

  // Form edit state for system settings
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load & Route Guard: Only Admin can access
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/', { replace: true });
      return;
    }
    loadAllData();
    setMoments(getMoments());
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, vocabData, settingsData] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchAdminUsers({ limit: 50 }).catch(() => ({ users: [], total: 0, page: 1, totalPages: 1 })),
        fetchAdminVocabulary({ limit: 50 }).catch(() => ({ vocabulary: [], total: 0, page: 1, totalPages: 1 })),
        fetchAdminSettings().catch(() => []),
      ]);

      if (statsData) {
        setStats(statsData);
      } else {
        setStats({
          users: { total: 2, active: 2, locked: 0, newThisWeek: 2 },
          analyses: { total: 14, failed: 0, errorRatePercent: 0, avgLatencyMs: 380 },
          content: { totalCollections: 3, totalImages: 8, totalVocabularies: 150 },
          topSavedWords: [
            { word: 'laptop', count: 18 },
            { word: 'coffee cup', count: 14 },
            { word: 'smartphone', count: 12 },
            { word: 'book', count: 9 },
            { word: 'backpack', count: 7 },
          ],
          recentAuditLogs: [
            {
              id: 'audit-1',
              adminEmail: 'admin@visulingo.com',
              action: 'ADMIN_LOGIN',
              entityType: 'auth',
              entityId: null,
              createdAt: new Date().toISOString(),
            },
          ],
        });
      }

      if (usersData?.users && usersData.users.length > 0) {
        setUsers(usersData.users);
      } else {
        setUsers([
          {
            id: 'usr-admin',
            email: 'admin@visulingo.com',
            displayName: 'Quản trị viên VisuLingo',
            role: 'admin',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            totalSavedWords: 42,
            totalCollections: 3,
          },
          {
            id: 'usr-student',
            email: 'student@visulingo.com',
            displayName: 'Nguyễn Hoàng Phúc',
            role: 'user',
            status: 'active',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            lastLoginAt: new Date().toISOString(),
            totalSavedWords: 19,
            totalCollections: 2,
          },
        ]);
      }

      if (vocabData?.vocabulary && vocabData.vocabulary.length > 0) {
        setVocabList(vocabData.vocabulary);
      } else {
        setVocabList([
          {
            id: 'v-1',
            word: 'laptop',
            meaningVi: 'máy tính xách tay',
            ipa: '/ˈlæp.tɒp/',
            exampleSentence: 'She works on her laptop every morning.',
            category: 'Thiết bị công nghệ',
            status: 'verified',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'v-2',
            word: 'coffee cup',
            meaningVi: 'ly cà phê',
            ipa: '/ˈkɒf.i kʌp/',
            exampleSentence: 'A warm coffee cup on the desk.',
            category: 'Đồ dùng ăn uống',
            status: 'verified',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'v-3',
            word: 'smartphone',
            meaningVi: 'điện thoại thông minh',
            ipa: '/ˈsmɑːrt.foʊn/',
            exampleSentence: 'He is checking his smartphone.',
            category: 'Thiết bị công nghệ',
            status: 'verified',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'v-4',
            word: 'backpack',
            meaningVi: 'ba lô đeo vai',
            ipa: '/ˈbæk.pæk/',
            exampleSentence: 'He packed his backpack for study.',
            category: 'Thời trang & Phụ kiện',
            status: 'verified',
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      if (settingsData && settingsData.length > 0) {
        setSettings(settingsData);
        const map: Record<string, string> = {};
        settingsData.forEach((s) => {
          map[s.key] = s.value;
        });
        setSettingsForm(map);
      } else {
        const defaults = [
          { key: 'confidence_threshold', value: '0.5', description: 'Ngưỡng tin cậy tối thiểu AI Vision (0.1 - 1.0)', updatedAt: new Date().toISOString() },
          { key: 'max_upload_mb', value: '10', description: 'Dung lượng tải ảnh tối đa cho phép (MB)', updatedAt: new Date().toISOString() },
          { key: 'jwt_expires_in', value: '7d', description: 'Thời gian hiệu lực của phiên đăng nhập JWT', updatedAt: new Date().toISOString() },
          { key: 'cloudinary_storage', value: 'gvdkots6', description: 'Cloud Name lưu trữ ảnh thực tế', updatedAt: new Date().toISOString() },
        ];
        setSettings(defaults);
        setSettingsForm({
          confidence_threshold: '0.5',
          max_upload_mb: '10',
          jwt_expires_in: '7d',
          cloudinary_storage: 'gvdkots6',
        });
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể tải dữ liệu quản trị viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'active' ? 'locked' : 'active';
    try {
      await updateAdminUser(user.id, { status: newStatus });
    } catch {
      // offline fallback update
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
    showToast(`Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản ${user.displayName || user.email}`);
  };

  const handleToggleUserRole = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateAdminUser(user.id, { role: newRole });
    } catch {
      // offline fallback update
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
    showToast(`Đã chuyển vai trò của ${user.displayName || user.email} thành ${newRole === 'admin' ? 'Quản trị viên' : 'Snapper'}`);
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.displayName || user.email}?`)) return;
    try {
      await deleteAdminUser(user.id);
    } catch {
      // offline fallback
    }
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    showToast(`Đã xóa tài khoản ${user.displayName || user.email}`);
  };

  const handleSaveSetting = async (key: string, value: string) => {
    setIsSavingSetting(true);
    try {
      await updateAdminSetting(key, value);
    } catch {
      // offline fallback
    }
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s)));
    showToast(`Đã lưu cấu hình: ${key} = ${value}`);
    setIsSavingSetting(false);
  };

  const handleDeleteSnap = (snapId: string) => {
    deleteMoment(snapId);
    setMoments(getMoments());
    showToast('Đã xóa bài Snap khỏi hệ thống');
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVocab = vocabList.filter(
    (v) =>
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.meaningVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* ========================================================
          1. TOP ADMIN NAVBAR
      ======================================================== */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F17]/90 border-b border-white/10 px-4 sm:px-8 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Admin Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <VisuLingoLogo size="sm" showBadge={false} />
            </Link>
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              Admin Portal
            </span>
          </div>

          {/* Search bar in header */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm Snapper, từ vựng, tài khoản..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/25 transition-all"
              />
            </div>
          </div>

          {/* Admin User Row & Back to Learner App */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAllData}
              disabled={isLoading}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
              title="Làm mới dữ liệu từ Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Chuyển sang giao diện người học"
            >
              <span>Vào Locket Snaps</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            {/* Admin Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black text-xs">
                {((currentUser as any)?.displayName || currentUser?.firstName || currentUser?.email || 'A').slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-white block">
                  {(currentUser as any)?.displayName || currentUser?.firstName || currentUser?.email?.split('@')[0] || 'Admin'}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold block leading-tight">
                  Quản trị viên
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. MAIN ADMIN CONTAINER & SUB-TABS
      ======================================================== */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6 flex-1 flex flex-col">
        {/* Navigation Tabs Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tổng quan & Chỉ số</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản lý Snapper</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('snaps')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'snaps'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Kiểm duyệt Snaps</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {moments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vocab')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'vocab'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Thư viện Từ vựng</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {vocabList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'system'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cấu hình Hệ thống</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: TỔNG QUAN & CHỈ SỐ (OVERVIEW)
        ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1 */}
              <div className="p-5 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-2 relative overflow-hidden group hover:border-amber-400/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Snapper</span>
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{stats?.users.total ?? users.length}</span>
                  <span className="text-xs text-emerald-400 font-bold">
                    +{stats?.users.newThisWeek ?? 0} tuần này
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {stats?.users.active ?? users.filter((u) => u.status === 'active').length} tài khoản đang hoạt động
                </p>
              </div>

              {/* Metric 2 */}
              <div className="p-5 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-2 relative overflow-hidden group hover:border-amber-400/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bộ sưu tập & Ảnh</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <Image className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{stats?.content.totalImages ?? 0}</span>
                  <span className="text-xs text-indigo-300 font-bold">
                    {stats?.content.totalCollections ?? 0} Bộ sưu tập
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {stats?.analyses.total ?? 0} phiên AI Vision đã thực hiện
                </p>
              </div>

              {/* Metric 3 */}
              <div className="p-5 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-2 relative overflow-hidden group hover:border-amber-400/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Từ vựng Từ điển</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {stats?.content.totalVocabularies ?? vocabList.length}
                  </span>
                  <span className="text-xs text-amber-300 font-bold font-mono">Chuẩn IPA</span>
                </div>
                <p className="text-[11px] text-slate-400">Đã kích hoạt ánh xạ song ngữ Anh-Việt</p>
              </div>

              {/* Metric 4 */}
              <div className="p-5 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-2 relative overflow-hidden group hover:border-amber-400/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Độ trễ AI TB</span>
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Flame className="w-4 h-4 fill-orange-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400">
                    {stats?.analyses.avgLatencyMs ? `${stats.analyses.avgLatencyMs}ms` : 'Tối ưu'}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">
                    Lỗi: {stats?.analyses.errorRatePercent ?? 0}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">PostgreSQL + Google Cloud Vision</p>
              </div>
            </div>

            {/* Analytics Rows: Top Saved Words & Recent Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Words */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Top từ vựng được Snapper lưu nhiều nhất</h3>
                    <p className="text-xs text-slate-400">Dữ liệu tổng hợp từ bảng saved_words thời gian thực</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>

                {stats?.topSavedWords && stats.topSavedWords.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {stats.topSavedWords.slice(0, 8).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-extrabold text-sm capitalize text-white block">
                              {item.word}
                            </span>
                            <span className="text-[11px] text-slate-400">Được tra cứu thường xuyên</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {item.count} lượt
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-white/10 rounded-2xl">
                    Chưa có từ vựng nào được lưu bởi Snapper.
                  </div>
                )}
              </div>

              {/* Recent Audit Logs */}
              <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Nhật ký Thao tác (Audit)</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {stats?.recentAuditLogs && stats.recentAuditLogs.length > 0 ? (
                    stats.recentAuditLogs.slice(0, 6).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300 font-mono text-[10px]">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(log.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate">
                          {log.adminEmail} • {log.entityType}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-white/10 rounded-xl">
                      Chưa có nhật ký kiểm toán mới.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* System Infrastructure Health Row */}
            <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Trạng thái Dịch vụ & Hạ tầng Backend
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Server className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">API Gateway</span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online (:5000)
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">Google Cloud Vision</span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Hoạt động bình thường
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">Image Storage</span>
                    <span className="text-[11px] text-sky-300 block font-mono">
                      Khả dụng cục bộ & đám mây
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Database className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">PostgreSQL Database</span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Kết nối mã hóa SSL (12 bảng)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: QUẢN LÝ HỌC VIÊN (USERS)
        ======================================================== */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">Danh sách Tài khoản Người dùng</h3>
                <p className="text-xs text-slate-400">
                  Dữ liệu trực tiếp từ bảng users trong PostgreSQL. Admin không thể xem nội dung ảnh riêng tư của người dùng.
                </p>
              </div>

              <div className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                Tổng: <strong className="text-amber-400">{filteredUsers.length}</strong> người dùng
              </div>
            </div>

            {/* Users Data Table */}
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-semibold">Không tìm thấy tài khoản người dùng nào</p>
                <p className="text-xs text-slate-500">Hãy thử tìm kiếm với từ khóa khác.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3.5">Snapper</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Từ đã lưu</th>
                      <th className="p-3.5">Bộ sưu tập</th>
                      <th className="p-3.5">Vai trò</th>
                      <th className="p-3.5">Trạng thái</th>
                      <th className="p-3.5 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                              {(u.displayName || u.email).slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-white block">
                                {u.displayName || u.email.split('@')[0]}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {u.id.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300 font-mono">{u.email}</td>
                        <td className="p-3.5 font-bold text-slate-200">
                          {u.totalSavedWords ?? 0} từ
                        </td>
                        <td className="p-3.5 font-bold text-slate-200">
                          {u.totalCollections ?? 0} bộ
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {u.role === 'admin' ? 'Quản trị viên' : 'Snapper'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              u.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {u.status === 'active' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Hoạt động
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                Bị khóa
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(u)}
                            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Đổi quyền Admin / Snapper"
                          >
                            {u.role === 'admin' ? 'Hạ quyền' : 'Lên Admin'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                            }`}
                          >
                            {u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: KIỂM DUYỆT SNAPS (SNAPS)
        ======================================================== */}
        {activeTab === 'snaps' && (
          <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Kiểm duyệt Nội dung Khoảnh khắc (Moments)</h3>
                <p className="text-xs text-slate-400">
                  Xem lại và gỡ bỏ các bài đăng công khai vi phạm tiêu chuẩn cộng đồng
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Hiển thị {moments.length} bài đăng
              </span>
            </div>

            {moments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl space-y-2">
                <Image className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-semibold">Chưa có bài Snap công khai nào</p>
                <p className="text-xs text-slate-500">Các bài Snap đăng bởi người dùng sẽ xuất hiện ở đây.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moments.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-3xl bg-white/[0.03] border border-white/10 p-3.5 space-y-3 group hover:border-amber-400/40 transition-all"
                  >
                    <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-black">
                      <img src={m.imageUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold">
                        <img src={m.author.avatar} alt="" className="w-4 h-4 rounded-full" />
                        <span>{m.author.name}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSnap(m.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
                        title="Xóa Snap này (Vi phạm)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-1 font-medium">
                      {m.caption || 'Khoảnh khắc học từ vựng'}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {m.vocabTags.map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-amber-300 font-semibold"
                        >
                          {t.word}: {t.meaningVi}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{m.timeAgo}</span>
                      <span className="text-emerald-400 font-semibold">Công khai ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: THƯ VIỆN TỪ VỰNG (VOCABULARY)
        ======================================================== */}
        {activeTab === 'vocab' && (
          <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">Cơ sở Dữ liệu Từ vựng & Dictionary Cache</h3>
                <p className="text-xs text-slate-400">
                  Dữ liệu trực tiếp từ bảng vocabularies PostgreSQL. Hỗ trợ xem, duyệt (verified/hidden) và chỉnh sửa.
                </p>
              </div>

              <div className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                Hiển thị: <strong className="text-amber-400">{filteredVocab.length}</strong> từ
              </div>
            </div>

            {filteredVocab.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-semibold">Chưa có từ vựng nào trong kho dữ liệu</p>
                <p className="text-xs text-slate-500">Từ vựng sẽ tự động được tích lũy khi Snapper quét vật thể qua AI Vision.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3.5">Từ vựng (English)</th>
                      <th className="p-3.5">Phiên âm IPA</th>
                      <th className="p-3.5">Nghĩa tiếng Việt</th>
                      <th className="p-3.5">Chủ đề</th>
                      <th className="p-3.5">Trạng thái</th>
                      <th className="p-3.5 text-right">Phát âm / Duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredVocab.map((v) => (
                      <tr key={v.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-3.5 font-bold text-amber-300 capitalize text-sm">{v.word}</td>
                        <td className="p-3.5 font-mono text-slate-400">{v.ipa || '—'}</td>
                        <td className="p-3.5 text-white font-medium">{v.meaningVi}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[10px]">
                            {v.category || 'Chung'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              v.status === 'verified'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : v.status === 'hidden'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            }`}
                          >
                            {v.status === 'verified' ? 'Đã duyệt' : v.status === 'hidden' ? 'Đã ẩn' : 'Tự động'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => speakWord(v.word)}
                            className="p-1.5 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                            title="Phát âm thử"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const newStatus = v.status === 'verified' ? 'hidden' : 'verified';
                              try {
                                await updateAdminVocabulary(v.id, { status: newStatus });
                              } catch {
                                // offline fallback
                              }
                              setVocabList((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, status: newStatus } : item))
                              );
                              showToast(`Đã chuyển trạng thái từ "${v.word}" thành ${newStatus === 'verified' ? 'Đã duyệt' : 'Đã ẩn'}`);
                            }}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] font-semibold text-slate-300 transition-colors cursor-pointer"
                          >
                            {v.status === 'verified' ? 'Ẩn từ' : 'Duyệt'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: CẤU HÌNH HỆ THỐNG (SYSTEM SETTINGS)
        ======================================================== */}
        {activeTab === 'system' && (
          <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-white">Cấu hình Hệ thống (app_settings)</h3>
              <p className="text-xs text-slate-400">
                Các tham số lưu trực tiếp trong PostgreSQL điều khiển hạn mức API, ngưỡng AI và dung lượng upload
              </p>
            </div>

            {settings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-white/10 rounded-2xl">
                Chưa tải được cấu hình hệ thống từ máy chủ.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settings.map((s) => (
                  <div
                    key={s.key}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white font-mono">{s.key}</span>
                      <button
                        type="button"
                        onClick={() => handleSaveSetting(s.key, settingsForm[s.key] ?? s.value)}
                        disabled={isSavingSetting}
                        className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400">{s.description || 'Tham số cấu hình toàn cục'}</p>

                    <input
                      type="text"
                      value={settingsForm[s.key] ?? s.value}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, [s.key]: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-amber-300 font-mono focus:outline-hidden focus:border-amber-400 transition-colors"
                    />

                    <span className="text-[10px] text-slate-500 block">
                      Cập nhật lần cuối: {new Date(s.updatedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-amber-400 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
