import { Link } from 'react-router-dom';
import { ArrowLeft, Flame } from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';
import { LocketPocketView } from '@/components/locket/LocketPocketView';

function SavedWordsPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F17]/90 border-b border-white/10 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Quay lại Bảng tin Snaps"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <VisuLingoLogo size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-bold text-amber-300">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Snapbook Cá Nhân</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-4 flex-1 w-full">
        <LocketPocketView initialSubTab="words" />
      </main>
    </div>
  );
}

export default SavedWordsPage;
