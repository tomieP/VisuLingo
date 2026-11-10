import { incrementChallengeProgress, getUserXp } from '@/utils/challenges';
import { enrichVocabTag } from '@/utils/dictionary';
import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { Camera, Eye, EyeOff, Upload, Sparkles, Send, RefreshCw, FolderPlus, Bookmark, VideoOff, Palette, Lock, SwitchCamera, Smartphone } from 'lucide-react';
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

interface LocketCameraViewProps {
  onMomentShared?: () => void;
}

export function LocketCameraView({ onMomentShared }: LocketCameraViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const startLiveCamera = async (mode = facingMode) => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Trình duyệt của bạn không hỗ trợ mở camera trực tiếp. Vui lòng bấm "Camera máy".');
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
      console.error(err);
      alert('Không thể mở camera. Vui lòng cấp quyền truy cập Camera hoặc bấm "Camera máy".');
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
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front camera (selfie mirror)
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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
    if (!imageUrl || !detectionResult) return;
    setIsSharing(true);

    const chosenTheme = getTagThemeById(selectedSnapThemeId);
    const finalThemeId: TagThemeId = isTagThemeUnlocked(chosenTheme, userStats) ? selectedSnapThemeId : 'classic';

    // Map detected objects into Locket Vocab Tags with Vietnamese meanings and verified unlocked theme
    const vocabTags: VocabTag[] = detectionResult.objects.map((obj) => ({
      id: obj.id,
      word: obj.label,
      meaningVi: obj.meaningVi || getMeaningForWord(obj.label),
      ipa: obj.ipa || getIpaForWord(obj.label),
      example: obj.exampleSentence || '',
      confidence: obj.confidence,
      themeId: finalThemeId,
      x: Math.round((obj.boundingBox.x + obj.boundingBox.w / 2) * 100),
      y: Math.round((obj.boundingBox.y + obj.boundingBox.h / 2) * 100),
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
      vocabTags,
    });

    // Save to the selected Album collection
    savePhotoToAlbum(selectedAlbumId, imageUrl, vocabTags, caption.trim());
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

            {/* Floating Interactive Locket Stickers */}
            {detectionResult &&
              detectionResult.objects.map((obj) => {
                const enriched = enrichVocabTag({
                  word: obj.label,
                  meaningVi: obj.meaningVi,
                  ipa: obj.ipa,
                  example: obj.exampleSentence,
                });
                return (
                  <LocketSticker
                    key={obj.id}
                    word={obj.label}
                    meaningVi={enriched.meaningVi}
                    ipa={enriched.ipa}
                    example={enriched.example}
                    x={Math.round((obj.boundingBox.x + obj.boundingBox.w / 2) * 100)}
                    y={Math.round((obj.boundingBox.y + obj.boundingBox.h / 2) * 100)}
                    confidence={obj.confidence}
                    themeId={selectedSnapThemeId}
                    isFrozen={false}
                    isSelected={selectedObjectId === obj.id}
                    onSelect={() => setSelectedObjectId(obj.id)}
                  />
                );
              })}

            
            {/* Toggle Show/Hide Stickers Button (Eye icon) */}
            {detectionResult && detectionResult.objects.length > 0 && (
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
            {detectionResult && detectionResult.objects.length > 0 && (
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
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/90 transition-colors shadow-lg active:scale-95"
              title="Chụp lại"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ) : isLiveCamera ? (
          /* 2. Live Camera Viewfinder State */
          <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              webkit-playsinline="true"
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Floating Live Shutter Controls & Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40 pointer-events-none" />

            {/* Top Bar: Live indicator + Stop button */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto z-20">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>Live Camera</span>
              </span>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/90 transition-colors shadow-lg active:scale-90"
                title="Tắt Camera"
              >
                <VideoOff className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Controls: Shutter Button + Flip Camera */}
            <div className="absolute bottom-5 inset-x-5 flex items-center justify-between pointer-events-auto z-20">
              {/* Spacer on left */}
              <div className="w-12 h-12" />

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
                className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white hover:bg-black/80 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                title="Lật Camera (Trước/Sau)"
              >
                <SwitchCamera className="w-5 h-5 text-amber-400" />
              </button>
            </div>
          </div>
        ) : (
          /* 3. Empty Camera Start Screen */
          <div className="text-center p-4 sm:p-6 space-y-3.5 max-w-xs">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-400/20">
              <Camera className="w-9 h-9 sm:w-10 sm:h-10" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight">Chụp Snap xung quanh bạn</h3>
              <p className="text-xs text-slate-400 mt-1">
                Mở camera trực tiếp hoặc chọn ảnh đồ vật để AI tự động dán nhãn từ vựng!
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => startLiveCamera()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/25 transition-all hover:scale-105 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Bật Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-colors active:scale-95"
                title="Mở ứng dụng Camera gốc của máy"
              >
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span>Camera máy</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-colors active:scale-95"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Thư viện</span>
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
