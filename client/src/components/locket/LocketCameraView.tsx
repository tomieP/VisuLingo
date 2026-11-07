import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { Camera, Upload, Sparkles, Send, RefreshCw, FolderPlus, Bookmark, VideoOff } from 'lucide-react';
import { useDetection } from '@/hooks/useDetection';
import { DetectionResponse } from '@/types/detection';
import { LocketSticker } from './LocketSticker';
import { addMoment, VocabTag } from '@/utils/moments';
import { getAlbums, savePhotoToAlbum, Album } from '@/utils/albums';
import { CreateAlbumModal } from './CreateAlbumModal';

interface LocketCameraViewProps {
  onMomentShared?: () => void;
}

export function LocketCameraView({ onMomentShared }: LocketCameraViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('album-workspace');
  const [showCreateAlbum, setShowCreateAlbum] = useState<boolean>(false);

  // Live Camera Stream State
  const [isLiveCamera, setIsLiveCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setAlbums(getAlbums());
    const handleAlbums = () => setAlbums(getAlbums());
    window.addEventListener('visulingo_albums_changed', handleAlbums);
    return () => {
      window.removeEventListener('visulingo_albums_changed', handleAlbums);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
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

  const startLiveCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Trình duyệt của bạn không hỗ trợ mở camera trực tiếp.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsLiveCamera(true);
    } catch (err) {
      console.error(err);
      alert('Không thể mở camera. Vui lòng cấp quyền truy cập Camera hoặc chọn ảnh từ máy.');
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCamera(false);
  };

  const handleCaptureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera-snap.jpg', { type: 'image/jpeg' });
      stopLiveCamera();
      handleProcessFile(file);
    }, 'image/jpeg', 0.9);
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

const getMeaningForWord = (word: string) => {
    const dict: Record<string, string> = {
      laptop: 'máy tính xách tay',
      notebook: 'quyển sổ tay',
      'coffee cup': 'ly cà phê',
      cup: 'chiếc ly / cốc',
      coffee: 'cà phê',
      keyboard: 'bàn phím',
      mouse: 'chuột máy tính',
      book: 'cuốn sách',
      phone: 'điện thoại di động',
      desk: 'bàn làm việc',
      sofa: 'ghế sofa',
      chair: 'chiếc ghế',
      houseplant: 'cây cảnh trong nhà',
      cushion: 'gối tựa lưng',
      croissant: 'bánh sừng bò',
      fork: 'chiếc nĩa / dĩa',
      bread: 'bánh mì',
      flower: 'bông hoa',
      plant: 'chậu cây',
    };
    return dict[word.toLowerCase()] || 'đồ vật';
  };

  const getIpaForWord = (word: string) => {
    const ipaMap: Record<string, string> = {
      laptop: '/ˈlæp.tɒp/',
      notebook: '/ˈnəʊt.bʊk/',
      'coffee cup': '/ˈkɒf.i kʌp/',
      cup: '/kʌp/',
      coffee: '/ˈkɒf.i/',
      keyboard: '/ˈkiː.bɔːd/',
      mouse: '/maʊs/',
      book: '/bʊk/',
      phone: '/fəʊn/',
      desk: '/desk/',
      sofa: '/ˈsəʊ.fə/',
      chair: '/tʃeər/',
      houseplant: '/ˈhaʊs.plɑːnt/',
      cushion: '/ˈkʊʃ.ən/',
      croissant: '/ˈkrwɑː.sɒ̃/',
      fork: '/fɔːk/',
      bread: '/bred/',
    };
    return ipaMap[word.toLowerCase()] || '';
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

        {/* 1. Captured / Selected Photo State */}
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
        ) : isLiveCamera ? (
          /* 2. Live Camera Viewfinder State */
          <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Floating Live Shutter Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {/* Stop camera button */}
            <button
              type="button"
              onClick={stopLiveCamera}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/90 transition-colors shadow-lg pointer-events-auto"
              title="Tắt Camera"
            >
              <VideoOff className="w-4 h-4" />
            </button>

            {/* Big Circular Camera Shutter Button */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center pointer-events-auto">
              <button
                type="button"
                onClick={handleCaptureFromVideo}
                className="w-16 h-16 rounded-full border-4 border-white/90 p-1 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                title="Bấm để chụp Snap"
              >
                <div className="w-full h-full rounded-full bg-white group-hover:bg-amber-400 transition-colors shadow-inner" />
              </button>
            </div>
          </div>
        ) : (
          /* 3. Empty Camera Start Screen */
          <div className="text-center p-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-400/20">
              <Camera className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Chụp Snap xung quanh bạn</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Mở camera trực tiếp hoặc chọn ảnh đồ vật để AI tự động dán nhãn từ vựng!
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2.5 pt-1 flex-wrap">
              <button
                type="button"
                onClick={startLiveCamera}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition-all hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                <span>Bật Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-colors"
              >
                <Upload className="w-4 h-4 text-slate-300" />
                <span>Tải ảnh lên</span>
              </button>
            </div>
          </div>
        )}
      </div>

{/* Sharing and Album Options when Photo is Ready */}
      {imageUrl && detectionResult && (
        <div className="bg-[#161D2B]/90 border border-white/10 rounded-[28px] p-4 shadow-xl space-y-3.5 animate-in fade-in duration-200">
          {/* Target Album Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Lưu vào Album:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCreateAlbum(true)}
                className="text-amber-300 hover:underline flex items-center gap-1 text-[11px]"
              >
                <FolderPlus className="w-3 h-3" />
                <span>+ Album mới</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {albums.map((album) => (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => setSelectedAlbumId(album.id)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedAlbumId === album.id
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-102'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{album.emoji}</span>
                  <span>{album.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block px-1">
              Viết cảm nghĩ hoặc ghi chú từ mới:
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Bàn học sáng nay, học thêm từ laptop & coffee cup..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors"
            />
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShareToFeed}
            disabled={isSharing || isAnalyzing}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:opacity-95 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <Send className="w-4 h-4 fill-slate-950" />
            <span>Lưu vào Album & Đăng lên Feed</span>
          </button>
        </div>
      )}

      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={showCreateAlbum}
        onClose={() => setShowCreateAlbum(false)}
        onCreated={(newAlbumId) => setSelectedAlbumId(newAlbumId)}
      />
    </div>
  );
}
