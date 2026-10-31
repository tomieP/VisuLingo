import { BBOX } from '../config/constants';

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Clamp bbox values to 0..1 range
 */
export function clampBbox(bbox: BoundingBox): BoundingBox {
  return {
    x: Math.max(BBOX.MIN, Math.min(BBOX.MAX, bbox.x)),
    y: Math.max(BBOX.MIN, Math.min(BBOX.MAX, bbox.y)),
    w: Math.max(BBOX.MIN, Math.min(BBOX.MAX, bbox.w)),
    h: Math.max(BBOX.MIN, Math.min(BBOX.MAX, bbox.h)),
  };
}

/**
 * Validate that all bbox values are within 0..1 range
 */
export function isValidBbox(bbox: BoundingBox): boolean {
  const values = [bbox.x, bbox.y, bbox.w, bbox.h];
  return values.every(v => typeof v === 'number' && v >= BBOX.MIN && v <= BBOX.MAX);
}

/**
 * Validate confidence is within 0..1 range
 */
export function isValidConfidence(confidence: number): boolean {
  return typeof confidence === 'number' &&
    !isNaN(confidence) &&
    confidence >= BBOX.MIN &&
    confidence <= BBOX.MAX;
}