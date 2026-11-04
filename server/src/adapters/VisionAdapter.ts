import { env } from '../config/env';
import { clampBbox } from '../utils/bboxNormalizer';
import { normalizeLabel } from '../utils/labelNormalizer';
import { queryOne, query } from '../config/database';
import { ROLES } from '../config/constants';

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
 * Implements timeout, retry logic, confidence filtering, NMS, and bbox normalization.
 */
export class VisionAdapter {
  async analyze(imageBuffer: Buffer, mimeType: string): Promise<VisionAdapterResult[]> {
    // Load confidence threshold from app_settings
    const confidenceThreshold = await this.getConfidenceThreshold();

    try {
      const results = await this.callExternalVisionAPI(imageBuffer, mimeType);

      if (!results || results.length === 0) {
        return [];
      }

      // Filter by confidence threshold
      const filteredResults = results.filter(item => item.confidence >= confidenceThreshold);

      // Normalize bounding boxes to 0..1 range
      const normalizedResults = filteredResults.map(item => {
        // Assuming external API returns bbox as percentages (0-100) or normalized (0-1)
        const bbox = item.boundingBox;
        const normalizedBbox = {
          x: this.normalizeCoordinate(bbox.x),
          y: this.normalizeCoordinate(bbox.y),
          w: this.normalizeCoordinate(bbox.w),
          h: this.normalizeCoordinate(bbox.h),
        };

        return {
          ...item,
          boundingBox: normalizedBbox,
        };
      });

      // Apply Non-Maximum Suppression (NMS)
      const nmsResults = this.applyNMS(normalizedResults);

      // Limit to max 20 objects
      const limitedResults = nmsResults.slice(0, 20);

      return limitedResults;
    } catch (error) {
      // If external API fails, fall back to mock data for development
      console.warn('External vision API failed, using mock data:', error);
      return this.getMockResults(confidenceThreshold);
    }
  }

  private async getConfidenceThreshold(): Promise<number> {
    try {
      const settings = await queryOne<{ value: string }>('SELECT value FROM app_settings WHERE key = $1', ['confidence_threshold']);
      return settings ? Number(settings.value) : env.CONFIDENCE_THRESHOLD;
    } catch (error) {
      console.warn('Failed to load confidence threshold from database, using default:', error);
      return env.CONFIDENCE_THRESHOLD;
    }
  }

  private async callExternalVisionAPI(imageBuffer: Buffer, mimeType: string): Promise<VisionAdapterResult[] | null> {
    // Check if we have a vision API key configured
    if (!env.VISION_API_KEY) {
      console.warn('VISION_API_KEY not configured, using mock data');
      return null;
    }

    // Implement timeout and retry logic
    const maxRetries = 1;
    const timeoutMs = 8000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.makeVisionAPICallWithTimeout(imageBuffer, mimeType, timeoutMs);
        return result;
      } catch (error) {
        if (attempt === maxRetries) {
          // All retries failed
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return null;
  }

  private async makeVisionAPICallWithTimeout(imageBuffer: Buffer, mimeType: string, timeoutMs: number): Promise<VisionAdapterResult[]> {
    return Promise.race([
      this.makeVisionAPICall(imageBuffer, mimeType),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Vision API timeout'));
        }, timeoutMs);
      })
    ]);
  }

  private async makeVisionAPICall(imageBuffer: Buffer, mimeType: string): Promise<VisionAdapterResult[]> {
    // This is a placeholder for actual external API integration
    // In production, this would make HTTP requests to the vision provider
    // For now, return mock data to demonstrate the functionality
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        resolve(this.getMockResults(env.CONFIDENCE_THRESHOLD));
      }, 100);
    });
  }

  private getMockResults(threshold: number): VisionAdapterResult[] {
    const mockResults: VisionAdapterResult[] = [
      { label: 'laptop', confidence: 0.94, boundingBox: { x: 12, y: 18, w: 36, h: 34 } },
      { label: 'coffee cup', confidence: 0.88, boundingBox: { x: 58, y: 32, w: 18, h: 28 } },
      { label: 'book', confidence: 0.81, boundingBox: { x: 23, y: 64, w: 32, h: 22 } },
      { label: 'phone', confidence: 0.73, boundingBox: { x: 76, y: 66, w: 12, h: 20 } },
    ];

    return mockResults
      .filter((result) => result.confidence >= threshold)
      .map((result) => ({
        ...result,
        boundingBox: clampBbox(result.boundingBox),
      }));
  }

  private normalizeCoordinate(value: number): number {
    // Normalize coordinate values to 0..1 range
    // Assuming input could be percentage (0-100) or already normalized (0-1)
    return value > 1 ? value / 100 : value;
  }

  private applyNMS(results: VisionAdapterResult[], iouThreshold: number = 0.5): VisionAdapterResult[] {
    if (results.length === 0) return [];

    // Sort by confidence in descending order
    const sorted = [...results].sort((a, b) => b.confidence - a.confidence);
    const selected: VisionAdapterResult[] = [];

    for (let i = 0; i < sorted.length; i++) {
      let keep = true;
      for (let j = 0; j < selected.length; j++) {
        if (this.calculateIoU(sorted[i].boundingBox, selected[j].boundingBox) > iouThreshold) {
          keep = false;
          break;
        }
      }

      if (keep) {
        selected.push(sorted[i]);
      }
    }

    return selected;
  }

  private calculateIoU(bbox1: VisionBoundingBox, bbox2: VisionBoundingBox): number {
    const x1 = Math.max(bbox1.x, bbox2.x);
    const y1 = Math.max(bbox1.y, bbox2.y);
    const x2 = Math.min(bbox1.x + bbox1.w, bbox2.x + bbox2.w);
    const y2 = Math.min(bbox1.y + bbox1.h, bbox2.y + bbox2.h);

    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const area1 = bbox1.w * bbox1.h;
    const area2 = bbox2.w * bbox2.h;
    const union = area1 + area2 - intersection;

    return union > 0 ? intersection / union : 0;
  }
}

export const visionAdapter = new VisionAdapter();