import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { loginUser } from '@/services/authService';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      await loginUser({ email, password });
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Email hoặc mật khẩu không chính xác!';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-black">
      {/* Background glow effects */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <VisuLingoLogo size="lg" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white">Chào mừng trở lại!</h1>
          <p className="text-xs text-slate-400">
            Đăng nhập để xem Snaps của bạn bè và tiếp tục chuỗi streak 🔥
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mật khẩu
                </label>
              </div>
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 pt-3 disabled:opacity-50"
            >
              <span>{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Pill for Evaluation */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setEmail('demo@visulingo.app');
                setPassword('password123');
              }}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-amber-300 transition-colors text-center"
            >
              ⚡ Bấm để điền nhanh tài khoản thử nghiệm (Demo)
            </button>
          </div>

          {/* Bottom link to Register */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-xs text-slate-400">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-amber-400 font-bold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
