import { useState, useEffect } from 'react';
import { X, Download, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';
import { VisuLingoLogo } from '@/components/common/VisuLingoLogo';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(checkStandalone);

    const ua = navigator.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setActiveTab(ios ? 'ios' : 'android');

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        onClose();
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121824] border border-white/10 rounded-[28px] max-w-sm w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-400/10 blur-2xl rounded-full pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* App Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-amber-400/30 flex items-center justify-center p-2.5 shadow-2xl ring-4 ring-amber-400/20">
              <VisuLingoLogo size="xl" showWordmark={false} />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-full shadow-lg">
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">Tải VisuLingo về điện thoại</h3>
            <p className="text-xs text-slate-400 mt-1">
              Dùng như ứng dụng thật, mở toàn màn hình, học từ vựng và giữ streak mỗi ngày!
            </p>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 mt-5">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'android'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🤖 Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🍎 iOS (iPhone)</span>
          </button>
        </div>

        {isInstalled ? (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-emerald-300">
              Bạn đã cài đặt ứng dụng trên máy này rồi!
            </p>
            <p className="text-xs text-slate-400">
              Hãy mở icon VisuLingo từ màn hình chính để có trải nghiệm tốt nhất.
            </p>
          </div>
        ) : activeTab === 'android' ? (
          /* Android / Chrome Guide */
          <div className="mt-4 space-y-3">
            {deferredPrompt ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Cài đặt ứng dụng ngay</span>
              </button>
            ) : null}

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-slate-300">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                Hướng dẫn cho Android (Chrome / Cốc Cốc / Samsung):
              </div>
              <ol className="text-xs text-slate-300 space-y-2 pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Bấm biểu tượng <strong>3 dấu chấm (⋮)</strong> ở góc trên bên phải trình duyệt.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Bấm <strong>Cài đặt</strong> để đưa icon VisuLingo vàng ra màn hình chính.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        ) : (
          /* iOS Safari Guide */
          <div className="mt-4 space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-slate-300">
              <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                Hướng dẫn cho iPhone / iPad (Safari):
              </div>
              <ol className="text-xs text-slate-300 space-y-2 pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Bấm nút <strong>Chia sẻ (Share)</strong>{' '}
                    <Share className="w-3.5 h-3.5 inline text-sky-400 mx-0.5" /> ở thanh dưới của Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Cuộn xuống và chọn <strong>"Thêm vào MH chính"</strong>{' '}
                    <PlusSquare className="w-3.5 h-3.5 inline text-amber-300 mx-0.5" /> (Add to Home Screen).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Bấm <strong>Thêm (Add)</strong> ở góc trên bên phải màn hình.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          Để sau
        </button>
      </div>
    </div>
  );
}
