import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Volume2,
  Target,
  LogOut,
  Check,
  Shield,
  Trash2,
  Sparkles,
  Camera,
  Upload,
} from 'lucide-react';
import { getCurrentUser, updateCurrentUser, logoutUser } from '@/services/authService';
import { clearSavedWords, getSavedWords } from '@/utils/storage';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
];

function SettingsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [firstName, setFirstName] = useState(currentUser?.firstName || 'Bạn');
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem('visulingo_avatar') || AVATAR_OPTIONS[0]
  );
  const [dailyGoal, setDailyGoal] = useState<'5' | '10' | '20'>(
    (localStorage.getItem('visulingo_daily_goal') as any) || '10'
  );
  const [accent, setAccent] = useState<'en-US' | 'en-GB'>(
    (localStorage.getItem('visulingo_voice_accent') as any) || 'en-US'
  );
  const [savedCount, setSavedCount] = useState(0);
  const [savedToast, setSavedToast] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const handleUploadCustomAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng ảnh đại diện tối đa 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setSelectedAvatar(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    setSavedCount(getSavedWords().length);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({ firstName });
    localStorage.setItem('visulingo_avatar', selectedAvatar);
    window.dispatchEvent(new Event('visulingo_avatar_changed'));
    window.dispatchEvent(new Event('visulingo_moments_changed'));
    localStorage.setItem('visulingo_daily_goal', dailyGoal);
    localStorage.setItem('visulingo_voice_accent', accent);

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logoutUser();
      navigate('/login');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Hành động này sẽ xóa toàn bộ từ vựng đã lưu trong Snapbook. Bạn có chắc không?')) {
      clearSavedWords();
      setSavedCount(0);
      alert('Đã xóa dữ liệu thành công.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F17]/85 border-b border-white/5 py-3 px-4 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Link>
          <span className="font-extrabold text-sm tracking-tight text-white">
            Cài đặt & Hồ sơ
          </span>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto px-4 py-6 space-y-6 flex-1 pb-16">
        {/* Toast confirmation */}
        {savedToast && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center animate-in fade-in">
            ✓ Đã lưu cài đặt và hồ sơ thành công!
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar selector section */}
          <div className="bg-[#161D2B]/90 border border-white/10 rounded-[32px] p-5 shadow-xl text-center space-y-3.5">
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*"
              onChange={handleUploadCustomAvatar}
              className="hidden"
            />

            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ảnh đại diện Snap
            </span>

            {/* Avatar preview with Camera upload overlay */}
            <div className="flex justify-center">
              <div
                onClick={() => avatarFileRef.current?.click()}
                className="relative inline-block cursor-pointer group"
                title="Bấm để tải ảnh đại diện của bạn"
              >
                <img
                  src={selectedAvatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-xl shadow-amber-400/20 group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md border-2 border-[#161D2B] transition-transform group-hover:scale-110">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Upload action button */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all hover:scale-105"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh từ thiết bị</span>
              </button>
            </div>

            {/* Or choose from presets */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <p className="text-[11px] text-slate-400 font-medium">Hoặc chọn ảnh mẫu có sẵn:</p>
              <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                {AVATAR_OPTIONS.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(imgUrl)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                      selectedAvatar === imgUrl
                        ? 'border-amber-400 scale-110 ring-2 ring-amber-400/40'
                        : 'border-white/10 opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User info card */}
          <div className="bg-[#161D2B]/90 border border-white/10 rounded-[32px] p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <User className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm">Thông tin cá nhân</h3>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-hidden focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                readOnly
                value={currentUser?.email || 'Khách (Chưa đăng nhập)'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="bg-[#161D2B]/90 border border-white/10 rounded-[32px] p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm">Tùy chỉnh học tập</h3>
            </div>

            {/* Daily Goal */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Mục tiêu từ vựng mỗi ngày
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '5', label: '5 từ' },
                  { value: '10', label: '10 từ' },
                  { value: '20', label: '20 từ 🔥' },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setDailyGoal(g.value as any)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      dailyGoal === g.value
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pronunciation Accent */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Giọng đọc phát âm</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'en-US', label: '🇺🇸 Anh - Mỹ (US)' },
                  { value: 'en-GB', label: '🇬🇧 Anh - Anh (UK)' },
                ].map((acc) => (
                  <button
                    key={acc.value}
                    type="button"
                    onClick={() => setAccent(acc.value as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      accent === acc.value
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Lưu tất cả thay đổi</span>
          </button>
        </form>

        {/* Danger zone / Data management */}
        <div className="bg-[#161D2B]/90 border border-white/10 rounded-[32px] p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-slate-400">
            <Shield className="w-4 h-4" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Bộ nhớ & Tài khoản</h3>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-400">Từ vựng đã lưu trong Snapbook:</span>
            <span className="font-bold text-amber-400">{savedCount} từ</span>
          </div>

          <button
            type="button"
            onClick={handleClearAllData}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa toàn bộ từ vựng đã lưu</span>
          </button>

          {currentUser ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Đăng nhập hoặc Đăng ký ngay</span>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
