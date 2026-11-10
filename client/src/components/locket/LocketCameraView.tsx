import { incrementChallengeProgress, getUserXp } from '@/utils/challenges';
import { enrichVocabTag } from '@/utils/dictionary';
import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { Camera, Eye, EyeOff, Upload, Sparkles, Send, RefreshCw, FolderPlus, Bookmark, Palette, SwitchCamera, Lock } from 'lucide-react';
import { useDetection } from '@/hooks/useDetection';
import { DetectionResponse } from '@/types/detection';
import { LocketSticker } from './LocketSticker';
import { addMoment, VocabTag, getMoments, isFakeMoment } from '@/utils/moments';
import { getAlbums, savePhotoToAlbum, Album } from '@/utils/albums';
import { CreateAlbumModal } from './CreateAlbumModal';
import { getCurrentUser } from '@/services/authService';
import { TAG_THEMES, TagThemeId, getActiveTagThemeId, getTagThemeById, isTagThemeUnlocked, isUserSnapBoostVip } from '@/utils/tagThemes';
import { TagSkinModal } from './TagSkinModal';
import { getUserStreak, getSavedWords } from '@/utils/storage';
import { resolveStickerOverlaps } from '@/utils/stickerLayout';

interface LocketCameraViewProps {
  onMomentShared?: () => void;
}

export function LocketCameraView({ onMomentShared }: LocketCameraViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
  const [editableTags, setEditableTags] = useState<VocabTag[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [showStickers, setShowStickers] = useState<boolean>(true);
  const [caption, setCaption] = useState<string>('');
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('album-workspace');
  const [showCreateAlbum, setShowCreateAlbum] = useState<boolean>(false);
  const [selectedSnapThemeId, setSelectedSnapThemeId] = useState<TagThemeId>(getActiveTagThemeId());
  const [isTagSkinOpen, setIsTagSkinOpen] = useState<boolean>(false);

  // Compute live user stats for theme access control
  const userStats = {
    snaps: getMoments().filter((m) => !isFakeMoment(m)).length,
    streak: getUserStreak(),
    words: getSavedWords().length,
    listen: parseInt(localStorage.getItem('visulingo_listen_count') || '0', 10),
    xp: getUserXp(),
    isVip: isUserSnapBoostVip(),
  };

  // Live Camera Stream State
  const [isLiveCamera, setIsLiveCamera] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Apply optical or digital zoom
  const applyZoom = (targetZoom: number) => {
    const clamped = Math.min(Math.max(Number(targetZoom.toFixed(1)), 1), 4);
    setZoomLevel(clamped);

    // Try hardware track zoom if browser & device support it
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          const capabilities = (track.getCapabilities?.() as any) || {};
          if (capabilities.zoom) {
            const minZ = capabilities.zoom.min || 1;
            const maxZ = capabilities.zoom.max || 4;
            const hwZoom = Math.min(Math.max(clamped, minZ), maxZ);
            track.applyConstraints({ advanced: [{ zoom: hwZoom } as any] }).catch(() => {});
          }
        } catch {}
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoomLevel;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDistRef.current;
      applyZoom(touchStartZoomRef.current * factor);
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  // Re-attach stream to video element when it mounts or mode changes
  useEffect(() => {
    if (isLiveCamera && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().catch((err) => console.warn('Video play warning:', err));
      };
    }
  }, [isLiveCamera, facingMode]);

  useEffect(() => {
    setAlbums(getAlbums());
    const handleAlbums = () => setAlbums(getAlbums());
    const handleThemeChange = () => setSelectedSnapThemeId(getActiveTagThemeId());

    window.addEventListener('visulingo_albums_changed', handleAlbums);
    window.addEventListener('visulingo_tag_theme_changed', handleThemeChange);

    // Tự động mở Live Camera ngay khi vào app
    startLiveCamera('environment');

    return () => {
      window.removeEventListener('visulingo_albums_changed', handleAlbums);
      window.removeEventListener('visulingo_tag_theme_changed', handleThemeChange);
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
    setEditableTags([]);
    setSelectedObjectId(null);

    analyzeImage(file, {
      onSuccess: (data) => {
        setDetectionResult(data);
        const chosenTheme = getTagThemeById(selectedSnapThemeId);
        const finalThemeId: TagThemeId = isTagThemeUnlocked(chosenTheme, userStats) ? selectedSnapThemeId : 'classic';

        const rawTags: VocabTag[] = data.objects.map((obj) => {
          const enriched = enrichVocabTag({
            word: obj.label,
            meaningVi: obj.meaningVi || getMeaningForWord(obj.label),
            ipa: obj.ipa || getIpaForWord(obj.label),
            example: obj.exampleSentence,
          });
          return {
            id: obj.id,
            word: obj.label,
            meaningVi: enriched.meaningVi,
            ipa: enriched.ipa,
            example: enriched.example,
            confidence: obj.confidence,
            themeId: finalThemeId,
            x: Math.round((obj.boundingBox.x + obj.boundingBox.w / 2) * 100),
            y: Math.round((obj.boundingBox.y + obj.boundingBox.h / 2) * 100),
          };
        });

        // Smart anti-collision: push overlapping stickers apart so they never overlap
        const antiCollisionTags = resolveStickerOverlaps(rawTags);
        setEditableTags(antiCollisionTags);
      },
      onError: (err) => {
        console.error(err);
        alert('Không thể nhận diện ảnh. Vui lòng thử lại!');
      },
    });
  };

  // Sync chosen skin theme across active editable tags
  useEffect(() => {
    setEditableTags((prev) =>
      prev.map((t) => ({ ...t, themeId: selectedSnapThemeId }))
    );
  }, [selectedSnapThemeId]);

  const startLiveCamera = async (mode = facingMode) => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Trình duyệt chưa hỗ trợ truy cập camera trực tiếp.');
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      let stream: MediaStream;
      try {
        // Ưu tiên độ phân giải màn hình dọc trên điện thoại
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1080 },
            height: { ideal: 1920 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsLiveCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Live camera access error:', err);
      setCameraError('Vui lòng cho phép quyền Camera trên điện thoại để bắt đầu chụp.');
      setIsLiveCamera(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveCamera(false);
  };

  const handleCaptureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const vw = video.videoWidth || 720;
    const vh = video.videoHeight || 1280;
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front camera (selfie mirror)
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Apply digital crop if zoomed in
    if (zoomLevel > 1) {
      const cropW = vw / zoomLevel;
      const cropH = vh / zoomLevel;
      const cropX = (vw - cropW) / 2;
      const cropY = (vh - cropH) / 2;
      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera-snap.jpg', { type: 'image/jpeg' });
      stopLiveCamera();
      handleProcessFile(file);
    }, 'image/jpeg', 0.92);
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
    if (!imageUrl || editableTags.length === 0) return;
    setIsSharing(true);

    const chosenTheme = getTagThemeById(selectedSnapThemeId);
    const finalThemeId: TagThemeId = isTagThemeUnlocked(chosenTheme, userStats) ? selectedSnapThemeId : 'classic';

    // Use anti-collision positioned tags (including any manual drag adjustments)
    const finalVocabTags: VocabTag[] = editableTags.map((tag) => ({
      ...tag,
      themeId: finalThemeId,
    }));

    const currentUser = getCurrentUser();
    addMoment({
      author: {
        name: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (localStorage.getItem('visulingo_display_name') || 'Bạn (Me)'),
        avatar: localStorage.getItem('visulingo_avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        badge: 'Hôm nay 🔥',
      },
      caption: caption.trim() || 'Snap học từ mới của tôi ✨',
      imageUrl,
      tagThemeId: finalThemeId,
      vocabTags: finalVocabTags,
    });

    // Save to the selected Album collection
    savePhotoToAlbum(selectedAlbumId, imageUrl, finalVocabTags, caption.trim());
    incrementChallengeProgress('snap_photos', 1);

    setIsSharing(false);
    onMomentShared?.();
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-3 pb-24 px-0.5 sm:px-0">
      {/* Viewfinder Window (Polaroid / Locket mobile camera style) */}
      <div
        className={`relative bg-[#161D2B] border-2 border-white/15 rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-2xl w-full aspect-[3/4] max-h-[62dvh] sm:aspect-square flex flex-col items-center justify-center text-white transition-all ${
          imageUrl || isLiveCamera ? 'p-0' : 'p-4 sm:p-6'
        }`}
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
          <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
            <img src={imageUrl} alt="Khoảnh khắc" className="w-full h-full object-cover select-none" />

            {/* Scanning animation overlay when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <p className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                  AI đang nhận diện từ vựng...
                </p>
              </div>
            )}

            {/* Floating Interactive Locket Stickers with Anti-Collision & Drag */}
            {showStickers &&
              editableTags.map((tag) => (
                <LocketSticker
                  key={tag.id}
                  word={tag.word}
                  meaningVi={tag.meaningVi}
                  ipa={tag.ipa}
                  example={tag.example}
                  x={tag.x}
                  y={tag.y}
                  confidence={tag.confidence}
                  themeId={selectedSnapThemeId}
                  isFrozen={false}
                  isDraggable={true}
                  onPositionChange={(newX, newY) => {
                    setEditableTags((prev) =>
                      prev.map((t) => (t.id === tag.id ? { ...t, x: newX, y: newY } : t))
                    );
                  }}
                  isSelected={selectedObjectId === tag.id}
                  onSelect={() => setSelectedObjectId(tag.id)}
                />
              ))}

            {/* Helper tip: Drag stickers to customize position */}
            {editableTags.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-30 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] text-amber-300 font-semibold shadow-lg animate-in fade-in duration-300 whitespace-nowrap">
                ✨ Kéo nhãn để điều chỉnh vị trí theo ý thích
              </div>
            )}
            
            {/* Toggle Show/Hide Stickers Button (Eye icon) */}
            {editableTags.length > 0 && (
              <button
                type="button"
                onClick={() => setShowStickers(!showStickers)}
                className={`absolute top-3 left-3 px-2.5 py-1.5 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-lg flex items-center gap-1.5 z-30 ${
                  showStickers
                    ? 'bg-black/75 border-amber-400/50 text-amber-300 hover:bg-black/90'
                    : 'bg-black/70 border-white/20 text-slate-400 hover:text-white'
                }`}
                title={showStickers ? 'Bấm để ẩn nhãn từ vựng' : 'Bấm để hiện nhãn từ vựng'}
              >
                {showStickers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-bold select-none">
                  {showStickers ? 'Ẩn nhãn' : 'Hiện nhãn'}
                </span>
              </button>
            )}

            {/* Tag Skin Customizer Button - ONLY available before posting */}
            {editableTags.length > 0 && (
              <button
                type="button"
                onClick={() => setIsTagSkinOpen(true)}
                className="absolute top-3 left-26 sm:left-28 px-2.5 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/25 text-amber-300 text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-lg z-30 cursor-pointer active:scale-95"
                title="Đổi khung nhãn cho ảnh này trước khi đăng"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span className="select-none">
                  {getTagThemeById(selectedSnapThemeId).name.split('(')[0].trim()}
                </span>
              </button>
            )}

            {/* Retake button in top corner */}
            <button
              type="button"
              onClick={() => {
                setImageUrl(null);
                setDetectionResult(null);
                setEditableTags([]);
                setSelectedObjectId(null);
                startLiveCamera(facingMode);
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/90 transition-colors shadow-lg active:scale-95 cursor-pointer"
              title="Chụp lại"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ) : isLiveCamera ? (
          /* 2. Live Camera Viewfinder State */
          <div
            className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center touch-none select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              webkit-playsinline="true"
              muted
              style={{
                transform: `${facingMode === 'user' ? 'scaleX(-1) ' : ''}scale(${zoomLevel})`,
              }}
              className="w-full h-full object-cover transition-transform duration-100 ease-out origin-center pointer-events-none"
            />

            {/* Floating Live Shutter Controls & Soft Bottom Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            {/* Quick Zoom Switcher Pills (Floating above shutter, similar to iOS camera) */}
            <div className="absolute bottom-24 inset-x-0 flex items-center justify-center gap-2 pointer-events-auto z-20">
              {[1, 2, 3].map((level) => {
                const isActive = Math.abs(zoomLevel - level) < 0.3;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => applyZoom(level)}
                    className={`w-8 h-8 rounded-full text-xs font-black backdrop-blur-md transition-all active:scale-90 flex items-center justify-center shadow-lg cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-white scale-110 shadow-amber-400/40'
                        : 'bg-black/60 border border-white/20 text-white hover:bg-black/85'
                    }`}
                  >
                    {isActive && zoomLevel !== level ? `${zoomLevel}x` : `${level}x`}
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls: Upload Photo + Big Shutter Button + Flip Camera */}
            <div className="absolute bottom-4 inset-x-5 flex items-center justify-between pointer-events-auto z-20">
              {/* Tải ảnh lên (Upload from Gallery) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/25 text-white flex flex-col items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer group"
                title="Tải ảnh từ thư viện"
              >
                <Upload className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-extrabold text-slate-200 mt-0.5">Tải ảnh</span>
              </button>

              {/* Big Circular Camera Shutter Button */}
              <button
                type="button"
                onClick={handleCaptureFromVideo}
                className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all group cursor-pointer"
                title="Bấm để chụp Snap"
              >
                <div className="w-full h-full rounded-full bg-white group-hover:bg-amber-400 group-active:bg-amber-500 transition-colors shadow-inner" />
              </button>

              {/* Flip camera front/back */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/25 text-white flex flex-col items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer group"
                title="Lật Camera (Trước/Sau)"
              >
                <SwitchCamera className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
                <span className="text-[8px] font-extrabold text-slate-200 mt-0.5">Lật</span>
              </button>
            </div>
          </div>
        ) : (
          /* 3. Camera Initializing / Fallback Screen */
          <div className="text-center p-6 space-y-4 max-w-xs flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shadow-lg animate-pulse">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">
                {cameraError ? 'Chưa mở được Camera' : 'Đang bật Camera...'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {cameraError || 'Ứng dụng đang tự động kết nối camera thiết bị của bạn...'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 w-full pt-1">
              <button
                type="button"
                onClick={() => startLiveCamera(facingMode)}
                className="w-full py-2.5 px-4 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử lại mở Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Tải ảnh từ thư viện</span>
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

          {/* Quick Tag Frame Selector before posting */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Khung nhãn ảnh này (giữ nguyên sau khi đăng):</span>
              </span>
              <button
                type="button"
                onClick={() => setIsTagSkinOpen(true)}
                className="text-amber-300 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span>Xem tất cả ({TAG_THEMES.length}) →</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {TAG_THEMES.map((t) => {
                const isSelected = selectedSnapThemeId === t.id;
                const isUnlocked = isTagThemeUnlocked(t, userStats);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (!isUnlocked) {
                        setIsTagSkinOpen(true);
                      } else {
                        setSelectedSnapThemeId(t.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-102 ring-2 ring-amber-300'
                        : isUnlocked
                        ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                        : 'bg-white/3 border border-white/5 text-slate-500 hover:border-amber-400/30 hover:text-slate-300'
                    }`}
                    title={isUnlocked ? t.name : `${t.name} (Chưa mở khóa - bấm để xem chi tiết)`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.accentColor }}
                    />
                    <span>{t.name.split('(')[0].trim()}</span>
                    {!isUnlocked && <Lock className="w-2.5 h-2.5 text-amber-400/70" />}
                    {t.frameStyle && (
                      <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300">
                        🎨
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block px-1">
              Viết cảm nghĩ hoặc ghi chú từ mới:
            </label>
            <input
              type="text"
              placeholder="Ghi chú từ mới hoặc cảm nghĩ về khoảnh khắc này..."
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

      {/* Tag Skin Customizer Modal (Only accessible prior to posting) */}
      <TagSkinModal
        isOpen={isTagSkinOpen}
        onClose={() => setIsTagSkinOpen(false)}
      />
    </div>
  );
}
