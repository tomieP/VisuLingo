import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { Camera, Upload, Sparkles, Send, RefreshCw, Layers, FolderPlus, Bookmark } from 'lucide-react';
import { useDetection } from '@/hooks/useDetection';
import { DetectionResponse } from '@/types/detection';
import { LocketSticker } from './LocketSticker';
import { addMoment, VocabTag } from '@/utils/moments';
import { getAlbums, savePhotoToAlbum, Album } from '@/utils/albums';
import { CreateAlbumModal } from './CreateAlbumModal';

interface LocketCameraViewProps {
  onMomentShared?: () => void;
}

const LOCKET_PRESETS = [
  {
    name: 'Góc học tập 💻',
    url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Phòng khách 🌿',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bàn ăn sáng 🥐',
    url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
  },
];

export function LocketCameraView({ onMomentShared }: LocketCameraViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('album-workspace');
  const [showCreateAlbum, setShowCreateAlbum] = useState<boolean>(false);

  useEffect(() => {
    setAlbums(getAlbums());
    const handleAlbums = () => setAlbums(getAlbums());
    window.addEventListener('visulingo_albums_changed', handleAlbums);
    return () => window.removeEventListener('visulingo_albums_changed', handleAlbums);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { mutate: analyzeImage, isPending: isAnalyzing } = useDetection();

  const handleProcessFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);

    setDetectionResult(null);
    setSelectedObjectId(null);

    analyzeImage(file, {
      onSuccess: (data) => {
        setDetectionResult(data);
      },
      onError: (err) => {
        console.error(err);
        alert('Không thể nhận diện ảnh. Vui lòng thử lại!');
      },
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleProcessFile(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
    e.target.value = '';
  };

  const handleSelectPreset = async (presetUrl: string) => {
    try {
      setImageUrl(presetUrl);
      const res = await fetch(presetUrl);
      const blob = await res.blob();
      const file = new File([blob], 'preset.jpg', { type: 'image/jpeg' });
      
      setDetectionResult(null);
      setSelectedObjectId(null);

      analyzeImage(file, {
        onSuccess: (data) => {
          setDetectionResult(data);
        },
        onError: (err) => {
          console.error(err);
          alert('Không thể nhận diện ảnh. Vui lòng thử lại!');
        },
      });
    } catch {
      alert('Không thể tải ảnh mẫu. Vui lòng chọn ảnh từ máy.');
    }
  };

  const handleShareToFeed = () => {
    if (!imageUrl || !detectionResult) return;
    setIsSharing(true);

    // Map detected objects into Locket Vocab Tags with Vietnamese meanings
    const vocabTags: VocabTag[] = detectionResult.objects.map((obj) => ({
      id: obj.id,
      word: obj.label,
      meaningVi: getMeaningForWord(obj.label),
      ipa: getIpaForWord(obj.label),
      x: Math.round((obj.boundingBox.x + obj.boundingBox.w / 2) * 100),
      y: Math.round((obj.boundingBox.y + obj.boundingBox.h / 2) * 100),
    }));

    addMoment({
      author: {
        name: 'Bạn (Me)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        badge: 'Hôm nay 🔥',
      },
      caption: caption.trim() || 'Snap học từ mới của tôi ✨',
      imageUrl,
      vocabTags,
    });

    // Save to the selected Album collection
    savePhotoToAlbum(selectedAlbumId, imageUrl, vocabTags, caption.trim());

    setIsSharing(false);
    onMomentShared?.();
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      {/* Viewfinder Window (Polaroid / Locket style) */}
      <div
        className="relative bg-[#161D2B] border-2 border-white/15 rounded-[36px] overflow-hidden shadow-2xl aspect-4/3 sm:aspect-square flex flex-col items-center justify-center p-3 text-white"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          className="hidden"
        />

        {imageUrl ? (
          <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-black flex items-center justify-center">
            <img src={imageUrl} alt="Khoảnh khắc" className="w-full h-full object-cover select-none" />

            {/* Scanning animation overlay when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <p className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                  AI đang dán nhãn đồ vật...
                </p>
              </div>
            )}

            {/* Floating Interactive Locket Stickers */}
            {detectionResult &&
              detectionResult.objects.map((obj) => (
                <LocketSticker
                  key={obj.id}
                  word={obj.label}
                  meaningVi={getMeaningForWord(obj.label)}
                  ipa={getIpaForWord(obj.label)}
                  x={Math.round((obj.boundingBox.x + obj.boundingBox.w / 2) * 100)}
                  y={Math.round((obj.boundingBox.y + obj.boundingBox.h / 2) * 100)}
                  confidence={obj.confidence}
                  isSelected={selectedObjectId === obj.id}
                  onSelect={() => setSelectedObjectId(obj.id)}
                />
              ))}

            {/* Retake button in top corner */}
            <button
              type="button"
              onClick={() => {
                setImageUrl(null);
                setDetectionResult(null);
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/90 transition-colors shadow-lg"
              title="Chụp lại"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center p-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-400/20">
              <Camera className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Chụp Snap xung quanh bạn</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Chụp ngay góc bàn, phòng khách hoặc đồ vật đời thường để AI gắn nhãn từ vựng tức thì!
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition-all hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                <span>Chụp ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Tải ảnh có sẵn</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instant Presets (Try with 1 click) */}
      {!imageUrl && (
        <div className="space-y-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Snaps mẫu để thử nhanh:</span>
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LOCKET_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white whitespace-nowrap transition-all shrink-0"
              >
                <img src={preset.url} alt="" className="w-4 h-4 rounded-full object-cover" />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Share to Friends Moment Card when detected */}
      {imageUrl && detectionResult && (
        <div className="bg-[#161D2B]/90 border border-white/10 rounded-[28px] p-4 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-400/20 text-amber-300">
                <Layers className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold">
                Đã nhận diện {detectionResult.objects.length} đồ vật!
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Chạm vào tag trên ảnh để nghe</span>
          </div>

          {/* Caption input */}
          <input
            type="text"
            placeholder="Viết cảm nghĩ về Snap này... (VD: Đang cày bài tập ☕)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
          />

          {/* Select Album to save */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Lưu vào Album:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCreateAlbum(true)}
                className="text-amber-300 font-semibold hover:underline flex items-center gap-1 text-[11px]"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Tạo album mới</span>
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {albums.map((album) => (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => setSelectedAlbumId(album.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedAlbumId === album.id
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/20'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{album.emoji}</span>
                  <span>{album.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Share to Feed CTA */}
          <button
            type="button"
            onClick={handleShareToFeed}
            disabled={isSharing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-400/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Lưu vào Album & Chia sẻ lên Feed bạn bè</span>
          </button>
        </div>
      )}

      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={showCreateAlbum}
        onClose={() => setShowCreateAlbum(false)}
        onCreated={(id) => setSelectedAlbumId(id)}
      />
    </div>
  );
}

// Fallback dictionary map for fast mockup responsiveness
function getMeaningForWord(word: string): string {
  const dict: Record<string, string> = {
    laptop: 'máy tính xách tay',
    'coffee cup': 'ly cà phê',
    book: 'quyển sách',
    phone: 'điện thoại',
    chair: 'chiếc ghế',
    table: 'cái bàn',
    bottle: 'chai nước',
    cup: 'cái cốc',
  };
  return dict[word.toLowerCase()] || 'đồ vật';
}

function getIpaForWord(word: string): string {
  const dict: Record<string, string> = {
    laptop: '/ˈlæp.tɒp/',
    'coffee cup': '/ˈkɒf.i kʌp/',
    book: '/bʊk/',
    phone: '/fəʊn/',
    chair: '/tʃeər/',
    table: '/ˈteɪ.bəl/',
  };
  return dict[word.toLowerCase()] || '';
}
