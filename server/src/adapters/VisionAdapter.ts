import { env } from '../config/env';
import { clampBbox } from '../utils/bboxNormalizer';

export interface VisionBoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface VisionAdapterResult {
  label: string;
  confidence: number;
  boundingBox: VisionBoundingBox;
}

/**
 * Adapter boundary for external computer-vision providers.
 * Current implementation uses deterministic mock data for local development.
 */
export class VisionAdapter {
  async analyze(_imageBuffer: Buffer, _mimeType: string): Promise<VisionAdapterResult[]> {
    // Production integration point: call external vision API with image buffer here.
    const mockResults: VisionAdapterResult[] = [
      { label: 'laptop', confidence: 0.94, boundingBox: { x: 0.12, y: 0.18, w: 0.36, h: 0.34 } },
      { label: 'coffee cup', confidence: 0.88, boundingBox: { x: 0.58, y: 0.32, w: 0.18, h: 0.28 } },
      { label: 'book', confidence: 0.81, boundingBox: { x: 0.23, y: 0.64, w: 0.32, h: 0.22 } },
      { label: 'phone', confidence: 0.73, boundingBox: { x: 0.76, y: 0.66, w: 0.12, h: 0.2 } },
    ];

    return mockResults
      .filter((result) => result.confidence >= env.CONFIDENCE_THRESHOLD)
      .map((result) => ({
        ...result,
        boundingBox: clampBbox(result.boundingBox),
      }));
  }
}

export const visionAdapter = new VisionAdapter();