import { Camera, Users, BookmarkCheck } from 'lucide-react';

export type LocketTab = 'feed' | 'snap' | 'pocket';

interface LocketBottomBarProps {
  activeTab: LocketTab;
  onTabChange: (tab: LocketTab) => void;
  savedCount: number;
}

export function LocketBottomBar({ activeTab, onTabChange, savedCount }: LocketBottomBarProps) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-[#121824]/90 backdrop-blur-2xl border border-white/20 rounded-full px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex items-center justify-between text-white">
        {/* Tab 1: Friend Snaps */}
        <button
          type="button"
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'feed'
              ? 'text-amber-400 scale-105 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Snaps</span>
        </button>

        {/* Center Tab: Snap Camera Button */}
        <button
          type="button"
          onClick={() => onTabChange('snap')}
          className={`relative -top-3 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl ${
            activeTab === 'snap'
              ? 'bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 text-slate-950 scale-110 shadow-amber-500/40 ring-4 ring-amber-400/30'
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-105 shadow-blue-600/30 ring-2 ring-white/20'
          }`}
          title="Bấm chụp Snap mới"
        >
          <Camera className="w-6 h-6 stroke-[2.5]" />
          <span className="sr-only">Chụp Snap</span>
        </button>

        {/* Tab 3: Snapbook */}
        <button
          type="button"
          onClick={() => onTabChange('pocket')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all relative ${
            activeTab === 'pocket'
              ? 'text-amber-400 scale-105 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <BookmarkCheck className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center">
                {savedCount > 99 ? '99+' : savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Snapbook</span>
        </button>
      </div>
    </div>
  );
}
