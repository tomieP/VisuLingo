import { env } from '../config/env';
import { clampBbox } from '../utils/bboxNormalizer';
import { normalizeLabel } from '../utils/labelNormalizer';
import { queryOne, query } from '../config/database';
import logger from '../utils/logger';

export interface VisionBoundingBox {
  x: number; // 0..1
  y: number; // 0..1
  w: number; // 0..1
  h: number; // 0..1
}

export interface VisionAdapterResult {
  label: string;
  confidence: number;
  boundingBox: VisionBoundingBox;
  meaningVi?: string;
  ipa?: string;
  exampleSentence?: string;
}

/**
 * GeminiVisionAdapter integrates Google Gemini 2.5 Flash Multimodal Vision API
 * for high-speed, zero-shot object detection with simultaneous vocabulary, IPA phonetics,
 * and contextual Vietnamese translation generation.
 */
export class GeminiVisionAdapter {
  private getApiKey(): string {
    return env.GEMINI_API_KEY || env.VISION_API_KEY || process.env.GEMINI_API_KEY || '';
  }

  async analyze(imageBuffer: Buffer, mimeType: string): Promise<VisionAdapterResult[]> {
    const confidenceThreshold = await this.getConfidenceThreshold();
    const apiKey = this.getApiKey().trim();

    if (!apiKey) {
      logger.warn('[GeminiVisionAdapter] GEMINI_API_KEY not configured.');
      return [];
    }

    try {
      const results = await this.callGeminiVisionAPI(imageBuffer, mimeType, apiKey);
      if (!results || results.length === 0) {
        logger.info('[GeminiVisionAdapter] Gemini detected 0 objects.');
        return [];
      }

      // Filter by confidence threshold
      const filtered = results.filter((item) => item.confidence >= confidenceThreshold);

      // Apply NMS to remove overlapping boxes
      const nmsResults = this.applyNMS(filtered);

      // Auto-upsert into database vocabularies table if PostgreSQL connected
      this.saveDetectedWordsToDictionary(nmsResults).catch((err) => {
        logger.debug('Auto-dictionary save skipped:', err);
      });

      return nmsResults.slice(0, 15);
    } catch (error) {
      logger.error('[GeminiVisionAdapter] Gemini API call failed:', error);
      return [];
    }
  }

  private async getConfidenceThreshold(): Promise<number> {
    try {
      const settings = await queryOne<{ value: string }>(
        'SELECT value FROM app_settings WHERE key = $1',
        ['confidence_threshold']
      );
      return settings ? Number(settings.value) : env.CONFIDENCE_THRESHOLD;
    } catch {
      return env.CONFIDENCE_THRESHOLD;
    }
  }

  /**
   * Calls Google Gemini Multimodal Vision API with multi-model fallback.
   */
  private async callGeminiVisionAPI(
    imageBuffer: Buffer,
    mimeType: string,
    apiKey: string
  ): Promise<VisionAdapterResult[]> {
    const base64Data = imageBuffer.toString('base64');
    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-2.5-flash',
    ];

    const promptText = `You are an expert English vocabulary tutor and computer vision assistant for VisuLingo (an English learning app).
Analyze this image and identify 3 to 10 prominent physical objects, clothing items, everyday objects, food, nature, or clear features that learners can learn (e.g. jacket, tie, collar, shirt, hair, glasses, face, book, pen, laptop, coffee cup, chair, table, dog, cat, tree, car, etc.).

For each object:
- "label": English noun in lowercase singular (e.g., "jacket", "tie", "collar", "hair", "coffee cup")
- "meaningVi": Natural, accurate Vietnamese translation (e.g., "áo khoác", "cà vạt", "cổ áo", "mái tóc", "tách cà phê")
- "ipa": Standard IPA phonetics (e.g., "/ˈdʒæk.ɪt/", "/taɪ/", "/ˈkɑː.lɚ/")
- "exampleSentence": Short practical English sentence using the word
- "confidence": Float between 0.70 and 0.99
- "box_2d": Bounding box coordinates in [ymin, xmin, ymax, xmax] format (normalized 0 to 1000).

Return ONLY a valid JSON array matching this format without markdown code fences:
[
  {
    "label": "jacket",
    "meaningVi": "áo khoác",
    "ipa": "/ˈdʒæk.ɪt/",
    "exampleSentence": "He wears a school jacket.",
    "confidence": 0.95,
    "box_2d": [470, 110, 890, 350]
  }
]`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    };

    let lastError: any = null;

    for (const model of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorText = await response.text();
          logger.warn(`[GeminiVisionAdapter] Model ${model} returned HTTP ${response.status}: ${errorText.substring(0, 150)}... Trying next candidate...`);
          lastError = new Error(`Gemini API HTTP ${response.status}: ${errorText}`);
          continue;
        }

        const data: any = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        let parsed: any[] = [];
        try {
          parsed = JSON.parse(rawText);
        } catch {
          const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          parsed = JSON.parse(cleaned);
        }

        if (!Array.isArray(parsed) || parsed.length === 0) continue;

        return parsed.map((item) => {
          let bbox: VisionBoundingBox = { x: 0.1, y: 0.1, w: 0.3, h: 0.3 };
          if (Array.isArray(item.box_2d) && item.box_2d.length === 4) {
            const [ymin, xmin, ymax, xmax] = item.box_2d;
            const normYmin = ymin > 1 ? ymin / 1000 : ymin;
            const normXmin = xmin > 1 ? xmin / 1000 : xmin;
            const normYmax = ymax > 1 ? ymax / 1000 : ymax;
            const normXmax = xmax > 1 ? xmax / 1000 : xmax;

            const y = Math.max(0, Math.min(1, normYmin));
            const x = Math.max(0, Math.min(1, normXmin));
            const h = Math.max(0.05, Math.min(1 - y, normYmax - normYmin));
            const w = Math.max(0.05, Math.min(1 - x, normXmax - normXmin));
            bbox = clampBbox({ x, y, w, h });
          }

          return {
            label: normalizeLabel(item.label || 'object'),
            confidence: typeof item.confidence === 'number' ? item.confidence : 0.9,
            boundingBox: bbox,
            meaningVi: item.meaningVi || 'đồ vật',
            ipa: item.ipa || '',
            exampleSentence: item.exampleSentence || '',
          };
        });
      } catch (err: any) {
        clearTimeout(timeout);
        logger.warn(`[GeminiVisionAdapter] Model ${model} failed with ${err.message}. Trying next candidate...`);
        lastError = err;
      }
    }

    if (lastError) {
      throw lastError;
    }
    return [];
  }

  private async saveDetectedWordsToDictionary(objects: VisionAdapterResult[]): Promise<void> {
    for (const obj of objects) {
      if (!obj.label || !obj.meaningVi) continue;
      try {
        await query(
          `INSERT INTO vocabularies (word, meaning_vi, ipa, example_sentence, source, status)
           VALUES ($1, $2, $3, $4, 'ai_gemini', 'verified')
           ON CONFLICT (word) DO UPDATE SET
             meaning_vi = COALESCE(NULLIF(EXCLUDED.meaning_vi, ''), vocabularies.meaning_vi),
             ipa = COALESCE(NULLIF(EXCLUDED.ipa, ''), vocabularies.ipa),
             example_sentence = COALESCE(NULLIF(EXCLUDED.example_sentence, ''), vocabularies.example_sentence)`,
          [obj.label.toLowerCase().trim(), obj.meaningVi, obj.ipa || '', obj.exampleSentence || '']
        );
      } catch {
        // Ignored if DB offline
      }
    }
  }

  private applyNMS(results: VisionAdapterResult[], iouThreshold = 0.5): VisionAdapterResult[] {
    if (results.length === 0) return [];
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

  private calculateIoU(box1: VisionBoundingBox, box2: VisionBoundingBox): number {
    const xA = Math.max(box1.x, box2.x);
    const yA = Math.max(box1.y, box2.y);
    const xB = Math.min(box1.x + box1.w, box2.x + box2.w);
    const yB = Math.min(box1.y + box1.h, box2.y + box2.h);

    const interW = Math.max(0, xB - xA);
    const interH = Math.max(0, yB - yA);
    const interArea = interW * interH;

    const box1Area = box1.w * box1.h;
    const box2Area = box2.w * box2.h;
    const unionArea = box1Area + box2Area - interArea;

    return unionArea > 0 ? interArea / unionArea : 0;
  }
}

export const visionAdapter = new GeminiVisionAdapter();
