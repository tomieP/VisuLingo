import { BoundingBox } from '@/types/detection';

export interface PixelCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function toPixelCoords(
  bbox: BoundingBox,
  containerWidth: number,
  containerHeight: number
): PixelCoords {
  return {
    x: bbox.x * containerWidth,
    y: bbox.y * containerHeight,
    w: bbox.w * containerWidth,
    h: bbox.h * containerHeight,
  };
}

export function fromPixelCoords(
  pixelCoords: PixelCoords,
  containerWidth: number,
  containerHeight: number
): BoundingBox {
  return {
    x: Math.max(0, Math.min(1, pixelCoords.x / containerWidth)),
    y: Math.max(0, Math.min(1, pixelCoords.y / containerHeight)),
    w: Math.max(0, Math.min(1, pixelCoords.w / containerWidth)),
    h: Math.max(0, Math.min(1, pixelCoords.h / containerHeight)),
  };
}