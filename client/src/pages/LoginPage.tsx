import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, User as UserIcon, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { loginUser } from '@/services/authService';

type LoginRole = 'student' | 'admin';

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<LoginRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      const auth = await loginUser({ email, password });
      
      // Navigate based on role or account type
      if (auth.user.role === 'admin' || role === 'admin' || email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Email hoặc mật khẩu không chính xác!';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (selected: LoginRole) => {
    setRole(selected);
    setError(null);
    if (selected === 'admin') {
      setEmail('admin@visulingo.app');
      setPassword('admin123456');
    } else {
      setEmail('demo@visulingo.app');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-black relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 -right-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-5 my-8">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group hover:opacity-95 transition-opacity">
            <VisuLingoLogo size="lg" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {role === 'admin' ? 'Cổng Quản Trị Hệ Thống' : 'Chào mừng trở lại!'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {role === 'admin'
              ? 'Đăng nhập với quyền Quản trị viên để quản lý người dùng, từ vựng và số liệu'
              : 'Đăng nhập để xem Snaps của bạn bè và tiếp tục chuỗi streak 🔥'}
          </p>
        </div>

        {/* Role Segmented Selector */}
        <div className="p-1 rounded-2xl bg-white/[0.05] border border-white/10 flex gap-1 shadow-lg">
          <button
            type="button"
            onClick={() => handleSelectRole('student')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'student'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Học viên</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('admin')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'admin'
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quản trị viên (Admin)</span>
          </button>
        </div>

        {/* Card Form */}
        <div className="bg-[#161D2B]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {role === 'admin' ? 'Tài khoản Admin' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={role === 'admin' ? 'admin@visulingo.app' : 'name@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/25 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => alert('Vui lòng sử dụng tài khoản thử nghiệm điền sẵn bên dưới để đăng nhập ngay!')}
                  className="text-[11px] text-amber-400 hover:underline font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-400 accent-amber-400 focus:ring-0 cursor-pointer"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <span className="text-[10px] text-slate-500">Bảo mật JWT 256-bit</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Đang xử lý...' : role === 'admin' ? 'Vào Bảng Quản Trị' : 'Đăng nhập ngay'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Fill Options */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Tài khoản điền nhanh (Thử nghiệm)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole('student')}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'student'
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>🎓 Học viên</span>
                <span className="text-[9px] opacity-75 font-mono">Demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'admin'
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>🛡️ Admin Portal</span>
              </button>
            </div>
          </div>

          {/* Bottom link to Register */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Chưa có tài khoản học tập?{' '}
              <Link to="/register" className="text-amber-400 font-bold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Feature Badges Footer */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium select-none pt-2">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI Vision
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            Streak hàng ngày
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Từ vựng bản xứ
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
