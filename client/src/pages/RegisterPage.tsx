import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, Target } from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { registerUser } from '@/services/authService';

function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dailyGoal, setDailyGoal] = useState<'5' | '10' | '20'>('10');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Mật khẩu phải có tối thiểu 8 ký tự');
      return;
    }

    try {
      setIsLoading(true);
      await registerUser({
        email,
        password,
        firstName,
        lastName,
      });

      // Save user preferences
      localStorage.setItem('visulingo_daily_goal', dailyGoal);

      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Đăng ký không thành công. Vui lòng thử lại!';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-black">
      {/* Background glow effects */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <VisuLingoLogo size="lg" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white">Tạo tài khoản học tập</h1>
          <p className="text-xs text-slate-400">
            Bắt trọn khoảnh khắc và kết nối cùng cộng đồng học tiếng Anh
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#161D2B]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tên
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Quân"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Họ
                </label>
                <input
                  type="text"
                  placeholder="Minh"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Mật khẩu (tối thiểu 8 ký tự)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Daily Goal Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Mục tiêu học mỗi ngày</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '5', label: '5 từ', desc: 'Nhẹ nhàng' },
                  { value: '10', label: '10 từ', desc: 'Vừa sức' },
                  { value: '20', label: '20 từ', desc: 'Tăng tốc 🔥' },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setDailyGoal(g.value as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      dailyGoal === g.value
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{g.label}</div>
                    <div className="text-[10px] text-slate-400">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 pt-3 disabled:opacity-50"
            >
              <span>{isLoading ? 'Đang tạo tài khoản...' : 'Bắt đầu học ngay'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom link to Login */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-xs text-slate-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-amber-400 font-bold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
