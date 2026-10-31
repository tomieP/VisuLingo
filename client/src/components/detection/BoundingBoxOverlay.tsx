import { useState } from 'react';
import { DetectedObject } from '@/types/detection';
import { Volume2 } from 'lucide-react';
import { speakWord } from '@/utils/speech';

interface BoundingBoxOverlayProps {
  objects: DetectedObject[];
  onObjectClick?: (object: DetectedObject) => void;
  selectedObjectId?: string;
  hoveredObjectId?: string | null;
  onObjectHover?: (objectId: string | null) => void;
  showSpotlight?: boolean;
}

export function BoundingBoxOverlay({
  objects,
  onObjectClick,
  selectedObjectId,
  hoveredObjectId,
  onObjectHover,
  showSpotlight = false,
}: BoundingBoxOverlayProps) {
  const [internalHover, setInternalHover] = useState<string | null>(null);

  if (objects.length === 0) return null;

  const currentHover = hoveredObjectId ?? internalHover;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {objects.map((obj) => {
        const isSelected = selectedObjectId === obj.id;
        const isHovered = currentHover === obj.id;

        // Coordinates in normalized scale (0..1) converted to percentage
        const left = `${obj.boundingBox.x * 100}%`;
        const top = `${obj.boundingBox.y * 100}%`;
        const width = `${obj.boundingBox.w * 100}%`;
        const height = `${obj.boundingBox.h * 100}%`;

        // Confidence color indicator
        const isHighConfidence = obj.confidence >= 0.85;

        return (
          <div
            key={obj.id}
            className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 rounded-md ${
              isSelected
                ? 'border-3 border-blue-500 bg-blue-500/15 ring-4 ring-blue-400/30 z-30 shadow-lg shadow-blue-500/20'
                : isHovered
                ? 'border-2 border-indigo-400 bg-indigo-500/10 z-20 shadow-md'
                : showSpotlight && selectedObjectId
                ? 'border border-slate-300/40 opacity-30 z-10'
                : 'border-2 border-amber-400/90 hover:border-amber-500 bg-amber-400/5 hover:bg-amber-400/15 z-10'
            }`}
            style={{ left, top, width, height }}
            onClick={() => onObjectClick?.(obj)}
            onMouseEnter={() => {
              setInternalHover(obj.id);
              onObjectHover?.(obj.id);
            }}
            onMouseLeave={() => {
              setInternalHover(null);
              onObjectHover?.(null);
            }}
            role="button"
            tabIndex={0}
            aria-label={`${obj.label} - ${Math.round(obj.confidence * 100)}%`}
          >
            {/* Interactive floating label badge */}
            <div
              className={`absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold whitespace-nowrap shadow-md transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white scale-105 shadow-blue-500/30 ring-2 ring-white z-40'
                  : isHovered
                  ? 'bg-indigo-600 text-white scale-100 z-30'
                  : 'bg-slate-900/85 text-white backdrop-blur-xs'
              }`}
            >
              <span className="capitalize">{obj.label}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded ${
                  isHighConfidence ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {Math.round(obj.confidence * 100)}%
              </span>

              {/* Fast pronounce button on hover */}
              {(isHovered || isSelected) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(obj.label);
                  }}
                  className="ml-1 p-0.5 hover:text-amber-200 transition-colors"
                  title="Nghe phát âm từ này"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Corner visual indicators */}
            {isSelected && (
              <span className="absolute bottom-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
