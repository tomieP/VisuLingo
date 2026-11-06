import { Camera, Users, BookmarkCheck, Compass, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export type LocketTab = 'feed' | 'snap' | 'pocket';

interface LocketBottomBarProps {
  activeTab: LocketTab;
  onTabChange: (tab: LocketTab) => void;
  savedCount: number;
}

export function LocketBottomBar({ activeTab, onTabChange, savedCount }: LocketBottomBarProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3">
      <div className="bg-[#121824]/90 backdrop-blur-2xl border border-white/20 rounded-full px-4 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex items-center justify-between text-white">
        {/* Tab 1: Friend Snaps */}
        <button
          type="button"
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'feed'
              ? 'text-amber-400 scale-105 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Snaps</span>
        </button>

        {/* Tab 2: Khám phá (/explore) */}
        <Link
          to="/explore"
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all text-slate-400 hover:text-amber-400 hover:scale-105"
          title="Khám phá cộng đồng & bạn học"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Khám phá</span>
        </Link>

        {/* Center Tab: Snap Camera Button */}
        <button
          type="button"
          onClick={() => onTabChange('snap')}
          className={`relative -top-3 w-13 h-13 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
            activeTab === 'snap'
              ? 'bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 text-slate-950 scale-110 shadow-amber-500/40 ring-4 ring-amber-400/30'
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-105 shadow-blue-600/30 ring-2 ring-white/20'
          }`}
          title="Bấm chụp Snap mới"
        >
          <Camera className="w-6 h-6 stroke-[2.5]" />
          <span className="sr-only">Chụp Snap</span>
        </button>

        {/* Tab 4: Snapbook (Sổ từ vựng & Flashcards) */}
        <Link
          to="/saved"
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all text-slate-400 hover:text-amber-400 hover:scale-105 relative"
          title="Sổ từ vựng & Flashcards 3D"
        >
          <div className="relative">
            <BookmarkCheck className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center">
                {savedCount > 99 ? '99+' : savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Sổ từ</span>
        </Link>

        {/* Tab 5: Hồ sơ (/profile) */}
        <Link
          to="/profile"
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition-all text-slate-400 hover:text-amber-400 hover:scale-105"
          title="Hồ sơ cá nhân & Huy hiệu"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Hồ sơ</span>
        </Link>
      </div>
    </div>
  );
}
