import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Image as ImageIcon, LogIn, BookOpen } from 'lucide-react';
import { getSavedWords } from '@/utils/storage';

export function Navbar() {
  const location = useLocation();
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    // Initial count
    setSavedCount(getSavedWords().length);

    // Listen to storage update events
    const handleUpdate = () => {
      setSavedCount(getSavedWords().length);
    };

    window.addEventListener('visulingo_saved_words_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('visulingo_saved_words_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  VisuLingo
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full">
                  AI MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Học tiếng Anh qua ảnh thực tế
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Phân tích ảnh</span>
            </Link>

            <Link
              to="/saved"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                isActive('/saved')
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Sổ từ vựng</span>
              {savedCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full shadow-xs">
                  {savedCount}
                </span>
              )}
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            <Link
              to="/login"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isActive('/login')
                  ? 'border-slate-300 bg-slate-100 text-slate-900'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
