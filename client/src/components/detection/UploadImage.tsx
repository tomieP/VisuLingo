import { useState, DragEvent, ChangeEvent, useRef } from 'react';
import { UploadCloud, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { Loading } from '@/components/common/Loading';

interface UploadImageProps {
  onUpload: (file: File) => void;
  maxSizeMB?: number;
  isLoading?: boolean;
}

// Interactive preset sample photos for instant testing
const SAMPLE_PRESETS = [
  {
    name: 'Bàn làm việc',
    tag: 'Workspace',
    url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    description: 'Laptop, cốc nước, sách, điện thoại',
  },
  {
    name: 'Góc phòng khách',
    tag: 'Living Room',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    description: 'Ghế sofa, bàn trà, chậu cây',
  },
  {
    name: 'Bàn ăn sáng',
    tag: 'Breakfast',
    url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
    description: 'Cốc cà phê, bánh mì, thìa dĩa',
  },
];

export function UploadImage({ onUpload, maxSizeMB = 10, isLoading }: UploadImageProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh hợp lệ (JPEG, PNG, WebP)');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Dung lượng ảnh vượt quá giới hạn ${maxSizeMB}MB`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onUpload(file);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  // Convert an online sample image URL into a real File object
  const handleSelectSample = async (preset: typeof SAMPLE_PRESETS[0]) => {
    try {
      setIsLoadingSample(true);
      setError(null);
      const res = await fetch(preset.url);
      const blob = await res.blob();
      const file = new File([blob], `${preset.tag.toLowerCase()}.jpg`, { type: 'image/jpeg' });
      onUpload(file);
    } catch {
      setError('Không thể tải ảnh mẫu từ mạng. Vui lòng tải ảnh từ thiết bị của bạn.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drag & drop upload area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50/80 shadow-md scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 bg-white/60 hover:bg-white shadow-xs'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
          className="hidden"
          aria-label="Tải ảnh lên"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onChange}
          className="hidden"
          aria-label="Chụp ảnh bằng camera"
        />

        {isLoading || isLoadingSample ? (
          <div className="py-6">
            <Loading message="AI đang nhận diện và phân tích vật thể trong ảnh..." />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-base font-bold text-slate-800">
                Kéo thả ảnh đời thường vào đây hoặc{' '}
                <span className="text-blue-600 hover:underline">duyệt từ máy</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Hỗ trợ JPEG, PNG, WebP (Tối đa {maxSizeMB}MB)
              </p>
            </div>

            {/* Mobile / camera quick button */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Chụp ảnh camera</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Quick Presets */}
      <div className="bg-white/80 rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hoặc thử ngay với ảnh mẫu có sẵn:</span>
          </span>
          <span className="text-[11px] text-slate-400">1-click test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              disabled={isLoading || isLoadingSample}
              onClick={() => handleSelectSample(preset)}
              className="group flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all text-left disabled:opacity-50"
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="w-11 h-11 rounded-lg object-cover group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                  {preset.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {preset.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
