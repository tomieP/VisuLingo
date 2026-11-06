import { useState } from 'react';
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
  Plus,
  RefreshCw,
  LogOut,
  Sparkles,
  ExternalLink,
  Volume2,
  Trash2,
  Server,
  Database,
  Cloud,
} from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { getMoments, MomentPost } from '@/utils/moments';
import { speakWord } from '@/utils/speech';
import { logoutUser } from '@/services/authService';

type AdminTab = 'overview' | 'users' | 'snaps' | 'vocab' | 'system';

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  streak: number;
  role: 'student' | 'admin' | 'moderator';
  status: 'active' | 'suspended';
  joinedDate: string;
  totalSnaps: number;
}

const INITIAL_ADMIN_USERS: AdminUserItem[] = [
  {
    id: 'u-1',
    name: 'Nguyễn Hoàng Phúc (Bạn)',
    email: 'nhphuc282@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    streak: 5,
    role: 'admin',
    status: 'active',
    joinedDate: '01/10/2026',
    totalSnaps: 24,
  },
  {
    id: 'u-2',
    name: 'Minh Quân',
    email: 'quan.m@visulingo.app',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    streak: 7,
    role: 'student',
    status: 'active',
    joinedDate: '10/10/2026',
    totalSnaps: 32,
  },
  {
    id: 'u-3',
    name: 'Khánh Linh',
    email: 'linh.k@visulingo.app',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    streak: 12,
    role: 'student',
    status: 'active',
    joinedDate: '12/10/2026',
    totalSnaps: 48,
  },
  {
    id: 'u-4',
    name: 'Thành Nam',
    email: 'nam.t@visulingo.app',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    streak: 4,
    role: 'student',
    status: 'active',
    joinedDate: '15/10/2026',
    totalSnaps: 18,
  },
  {
    id: 'u-5',
    name: 'Phương Thảo',
    email: 'thao.p@visulingo.app',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    streak: 9,
    role: 'student',
    status: 'active',
    joinedDate: '18/10/2026',
    totalSnaps: 29,
  },
];

interface VocabDictItem {
  id: string;
  word: string;
  meaningVi: string;
  ipa: string;
  category: string;
  occurrences: number;
}

const INITIAL_VOCAB_DICT: VocabDictItem[] = [
  { id: 'v-1', word: 'laptop', meaningVi: 'máy tính xách tay', ipa: '/ˈlæp.tɒp/', category: 'Công nghệ', occurrences: 842 },
  { id: 'v-2', word: 'coffee cup', meaningVi: 'tách cà phê', ipa: '/ˈkɒf.i kʌp/', category: 'Ẩm thực', occurrences: 612 },
  { id: 'v-3', word: 'notebook', meaningVi: 'vở ghi chép', ipa: '/ˈnəʊt.bʊk/', category: 'Học tập', occurrences: 480 },
  { id: 'v-4', word: 'keyboard', meaningVi: 'bàn phím', ipa: '/ˈkiː.bɔːd/', category: 'Công nghệ', occurrences: 390 },
  { id: 'v-5', word: 'croissant', meaningVi: 'bánh sừng bò', ipa: '/ˈkwæs.ɒ̃/', category: 'Ẩm thực', occurrences: 210 },
  { id: 'v-6', word: 'atmosphere', meaningVi: 'không khí, không gian', ipa: '/ˈæt.məs.fɪər/', category: 'Đời sống', occurrences: 195 },
  { id: 'v-7', word: 'fascinating', meaningVi: 'hấp dẫn, lôi cuốn', ipa: '/ˈfæs.ən.eɪ.tɪŋ/', category: 'Tính từ', occurrences: 140 },
];

function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUserItem[]>(INITIAL_ADMIN_USERS);
  const [vocabList, setVocabList] = useState<VocabDictItem[]>(INITIAL_VOCAB_DICT);
  const [moments, setMoments] = useState<MomentPost[]>(getMoments());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // System Settings state
  const [aiConfidence, setAiConfidence] = useState(0.65);
  const [storageProvider, setStorageProvider] = useState<'cloudinary' | 'local'>('cloudinary');
  const [autoStreak, setAutoStreak] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          showToast(`Đã ${newStatus === 'active' ? 'mở khóa' : 'tạm dừng'} tài khoản ${u.name}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleToggleUserRole = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newRole = u.role === 'admin' ? 'student' : 'admin';
          showToast(`Đã chuyển quyền của ${u.name} thành ${newRole === 'admin' ? 'Quản trị viên' : 'Học viên'}`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const handleDeleteSnap = (snapId: string) => {
    setMoments((prev) => prev.filter((m) => m.id !== snapId));
    showToast('Đã xóa bài Snap khỏi hệ thống');
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                placeholder="Tìm kiếm học viên, từ vựng, bài đăng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/25 transition-all"
              />
            </div>
          </div>

          {/* Admin User Row & Back to Learner App */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Chuyển sang giao diện người học"
            >
              <span>Vào App học</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            {/* Admin Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                alt="Admin"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400"
              />
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-white block">BotPhu (Admin)</span>
                <span className="text-[10px] text-emerald-400 font-semibold block leading-tight">
                  Super Admin
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
            <span>Quản lý Học viên</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
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
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Học viên</span>
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">1,428</span>
                  <span className="text-xs text-emerald-400 font-bold">+12% tuần này</span>
                </div>
                <p className="text-[11px] text-slate-400">89 người đang học trực tuyến</p>
              </div>

              {/* Metric 2 */}
              <div className="p-5 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-2 relative overflow-hidden group hover:border-amber-400/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Snaps đã quét</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <Image className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">8,924</span>
                  <span className="text-xs text-emerald-400 font-bold">+24% tuần này</span>
                </div>
                <p className="text-[11px] text-slate-400">Trung bình 6.2 snaps / học viên</p>
              </div>

              {/* Metric 3 */}
              <div className="p-5 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-2 relative overflow-hidden group hover:border-amber-400/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Từ vựng nhận diện</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">34,510</span>
                  <span className="text-xs text-amber-300 font-bold font-mono">100% IPA</span>
                </div>
                <p className="text-[11px] text-slate-400">Tỷ lệ chính xác AI: 96.8%</p>
              </div>

              {/* Metric 4 */}
              <div className="p-5 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-2 relative overflow-hidden group hover:border-amber-400/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ giữ Streak</span>
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Flame className="w-4 h-4 fill-orange-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400">87.4%</span>
                  <span className="text-xs text-emerald-400 font-bold">+5.2%</span>
                </div>
                <p className="text-[11px] text-slate-400">Cao điểm lúc 20:00 - 22:00 tối</p>
              </div>
            </div>

            {/* Analytics Rows: Activity Bars & Top Words */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Activity Chart Box */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Lưu lượng Snap & Học từ trong tuần</h3>
                    <p className="text-xs text-slate-400">Số bài Snap được chia sẻ theo từng ngày</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                    Tuần này 🔥
                  </span>
                </div>

                {/* Simulated Chart Bars */}
                <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
                  {[
                    { day: 'Thứ 2', val: 65, count: '1,120' },
                    { day: 'Thứ 3', val: 78, count: '1,340' },
                    { day: 'Thứ 4', val: 92, count: '1,590' },
                    { day: 'Thứ 5', val: 84, count: '1,450' },
                    { day: 'Thứ 6', val: 95, count: '1,680' },
                    { day: 'Thứ 7', val: 100, count: '1,890' },
                    { day: 'CN', val: 88, count: '1,520' },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.count}
                      </span>
                      <div
                        style={{ height: `${bar.val}%` }}
                        className="w-full rounded-2xl bg-gradient-to-t from-amber-500/40 via-amber-400 to-yellow-300 group-hover:brightness-125 transition-all shadow-md shadow-amber-400/10"
                      />
                      <span className="text-xs font-semibold text-slate-300">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Detected Vocab List */}
              <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Top từ vựng được chụp nhiều nhất</h3>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>

                <div className="space-y-2.5">
                  {vocabList.slice(0, 5).map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm capitalize text-white">
                              {item.word}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.ipa}</span>
                          </div>
                          <span className="text-xs text-slate-300">{item.meaningVi}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {item.occurrences} lần
                      </span>
                    </div>
                  ))}
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
                    <span className="text-xs font-bold text-white block">Cloudinary Storage</span>
                    <span className="text-[11px] text-sky-300 block font-mono">
                      3.2 GB / 25 GB khả dụng
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Database className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">PostgreSQL Database</span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Kết nối mã hóa SSL
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
                <h3 className="text-lg font-bold text-white">Danh sách Học viên & Tài khoản</h3>
                <p className="text-xs text-slate-400">
                  Quản lý quyền hạn, chuỗi streak và trạng thái hoạt động của từng người dùng
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Chức năng thêm tài khoản mới qua CSV hoặc Form thủ công')}
                  className="px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm tài khoản</span>
                </button>
              </div>
            </div>

            {/* Users Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Học viên</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Chuỗi Streak</th>
                    <th className="p-3.5">Tổng Snaps</th>
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
                          <img
                            src={u.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-white/15"
                          />
                          <div>
                            <span className="font-bold text-white block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono">{u.email}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          {u.streak} ngày
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-200">{u.totalSnaps} bài</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {u.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
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
                          onClick={() => handleToggleUserRole(u.id)}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Đổi quyền Admin / Học viên"
                        >
                          {u.role === 'admin' ? 'Hạ quyền' : 'Lên Admin'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: KIỂM DUYỆT SNAPS (SNAPS)
        ======================================================== */}
        {activeTab === 'snaps' && (
          <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Kiểm duyệt Nội dung & Snaps</h3>
                <p className="text-xs text-slate-400">
                  Xem lại toàn bộ ảnh đồ vật và từ vựng được chia sẻ công khai bởi các học viên
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Hiển thị {moments.length} bài đăng
              </span>
            </div>

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

                  {/* Detected tags */}
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
                    <span className="text-emerald-400 font-semibold">Đã duyệt ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: THƯ VIỆN TỪ VỰNG (VOCABULARY)
        ======================================================== */}
        {activeTab === 'vocab' && (
          <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">Cơ sở Dữ liệu Từ vựng & Dictionary API</h3>
                <p className="text-xs text-slate-400">
                  Hệ thống lưu trữ 34,500+ từ vựng thông dụng kèm phiên âm IPA chuẩn Oxford/Cambridge
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newWord = prompt('Nhập từ vựng tiếng Anh muốn thêm vào hệ thống:');
                  if (newWord && newWord.trim()) {
                    const newItem: VocabDictItem = {
                      id: `v-${Date.now()}`,
                      word: newWord.trim().toLowerCase(),
                      meaningVi: 'từ vựng mới thêm',
                      ipa: '/new.wɜːd/',
                      category: 'Tự tạo',
                      occurrences: 1,
                    };
                    setVocabList((prev) => [newItem, ...prev]);
                    showToast(`Đã thêm từ vựng "${newWord}" vào từ điển hệ thống`);
                  }
                }}
                className="px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm từ mới</span>
              </button>
            </div>

            {/* Vocab Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Từ vựng (English)</th>
                    <th className="p-3.5">Phiên âm IPA</th>
                    <th className="p-3.5">Nghĩa tiếng Việt</th>
                    <th className="p-3.5">Chủ đề</th>
                    <th className="p-3.5">Lượt quét AI</th>
                    <th className="p-3.5 text-right">Phát âm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredVocab.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3.5 font-bold text-amber-300 capitalize text-sm">{v.word}</td>
                      <td className="p-3.5 font-mono text-slate-400">{v.ipa}</td>
                      <td className="p-3.5 text-white font-medium">{v.meaningVi}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[10px]">
                          {v.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">{v.occurrences} lần</td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => speakWord(v.word)}
                          className="p-1.5 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                          title="Phát âm thử"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: CẤU HÌNH HỆ THỐNG (SYSTEM SETTINGS)
        ======================================================== */}
        {activeTab === 'system' && (
          <div className="p-6 rounded-3xl bg-[#161D2B]/90 border border-white/10 backdrop-blur-xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-white">Cấu hình Hệ thống & Trí tuệ Nhân tạo</h3>
              <p className="text-xs text-slate-400">
                Điều chỉnh các tham số nhận diện AI Vision, chuỗi streak và lưu trữ hình ảnh
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vision AI Confidence Setting */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Độ nhạy nhận diện AI (Confidence Threshold)</span>
                  <span className="font-mono font-bold text-amber-400">{Math.round(aiConfidence * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="0.95"
                  step="0.05"
                  value={aiConfidence}
                  onChange={(e) => setAiConfidence(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Mức độ tin cậy tối thiểu để AI gắn nhãn từ vựng cho đồ vật trong ảnh chụp
                </p>
              </div>

              {/* Storage Provider */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <span className="font-bold text-sm text-white block">Dịch vụ Lưu trữ Hình ảnh</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStorageProvider('cloudinary');
                      showToast('Đã chọn lưu trữ đám mây Cloudinary');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      storageProvider === 'cloudinary'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    Cloudinary (Đám mây)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStorageProvider('local');
                      showToast('Đã chọn lưu trữ cục bộ Local File System');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      storageProvider === 'local'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    Local Storage (Cục bộ)
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ảnh Snap được tối ưu dung lượng và sinh URL CDN phân phối tức thì
                </p>
              </div>

              {/* Auto Streak Policy */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Chính sách giữ lửa Streak tự động</span>
                  <input
                    type="checkbox"
                    checked={autoStreak}
                    onChange={(e) => setAutoStreak(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-400 accent-amber-400 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Tự động nhắc nhở người học qua thông báo và bảo vệ chuỗi Streak trong vòng 24 giờ kể từ bài snap gần nhất
                </p>
              </div>

              {/* Data Seed & Maintenance */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <span className="font-bold text-sm text-white block">Bảo trì & Dữ liệu mẫu</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('visulingo_chat_conversations_v3');
                    showToast('Đã làm mới dữ liệu hội thoại mẫu và bộ nhớ đệm!');
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-amber-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm mới dữ liệu mẫu (Seed Data)</span>
                </button>
                <p className="text-[11px] text-slate-400">
                  Khôi phục các bài đăng và đoạn chat mẫu để phục vụ kiểm thử và demo
                </p>
              </div>
            </div>
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
