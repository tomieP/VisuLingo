import { DetectedObject, BoundingBox } from '@/types/detection';
import { toPixelCoords } from '@/utils/bbox';

interface BoundingBoxOverlayProps {
  imageUrl: string;
  objects: DetectedObject[];
  containerWidth: number;
  containerHeight: number;
  onObjectClick?: (object: DetectedObject) => void;
  selectedObjectId?: string;
}

export function BoundingBoxOverlay({
  imageUrl,
  objects,
  containerWidth,
  containerHeight,
  onObjectClick,
  selectedObjectId,
}: BoundingBoxOverlayProps) {
  if (!imageUrl || objects.length === 0) return null;

  return (
    <div className="relative inline-block">
      <img
        src={imageUrl}
        alt="Analyzed image"
        className="max-w-full h-auto"
        width={containerWidth}
        height={containerHeight}
      />
      {objects.map((obj) => {
        const { x, y, w, h } = toPixelCoords(obj.boundingBox, containerWidth, containerHeight);
        const isSelected = selectedObjectId === obj.id;

        return (
          <button
            key={obj.id}
            onClick={() => onObjectClick?.(obj)}
            className={`absolute border-2 transition-all ${
              isSelected
                ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                : 'border-yellow-400 hover:border-yellow-500'
            }`}
            style={{
              left: `${x}px`,
              top: `${y}px`,
              width: `${w}px`,
              height: `${h}px`,
            }}
            aria-label={`${obj.label} (${Math.round(obj.confidence * 100)}% confidence)`}
          >
            <div
              className="absolute -top-6 left-0 bg-yellow-400 text-gray-900 text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
              style={{ transform: 'translateY(-100%)' }}
            >
              {obj.label} {Math.round(obj.confidence * 100)}%
            </div>
          </button>
        );
      })}
    </div>
  );
}