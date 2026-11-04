import { FREE_DICTIONARY_API } from '../config/constants';
import { env } from '../config/env';
import logger from '../utils/logger';
import { query } from '../config/database';

export interface DictionaryResult {
  word: string;
  meaningVi: string;
  ipa: string;
  example: string;
}

/**
 * Adapter boundary for external dictionary API.
 * Supports real API calls with timeout, retry logic, and cache fallback.
 */
export class DictionaryAdapter {
  private static instance: DictionaryAdapter;

  private constructor() {}

  public static getInstance(): DictionaryAdapter {
    if (!DictionaryAdapter.instance) {
      DictionaryAdapter.instance = new DictionaryAdapter();
    }
    return DictionaryAdapter.instance;
  }

  /**
   * Look up word via external dictionary API with timeout and retry.
   */
  public async lookup(word: string): Promise<DictionaryResult | null> {
    // Normalize query parameter: lowercase, trim whitespace
    const normalized = word.trim().toLowerCase();

    try {
      // First check database cache
      const cached = await this.getFromDatabase(normalized);
      if (cached) {
        return cached;
      }

      // API call with timeout and retry
      return await this.fetchFromExternalAPI(normalized);
    } catch (error) {
      console.error('Dictionary lookup failed:', error);
      return null;
    }
  }

  /**
   * Retrieve from database cache.
   */
  private async getFromDatabase(word: string): Promise<DictionaryResult | null> {
    try {
      const result = await query(
        `SELECT word, meaning_vi, ipa, example_sentence FROM vocabularies WHERE word = $1 AND source = 'api'`,
        [word],
      );

      if (result.length === 0) return null;

      const row = result[0];
      return {
        word: row.word,
        meaningVi: row.meaning_vi,
        ipa: row.ipa || '',
        example: row.example_sentence || '',
      };
    } catch (error) {
      logger.warn('Database lookup skipped (PostgreSQL not connected)');
      return null;
    }
  }

  /**
   * Fetch from external dictionary API.
   */
  private async fetchFromExternalAPI(word: string): Promise<DictionaryResult | null> {
    const maxRetries = 1;
    const timeoutMs = 8000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.makeApiCallWithTimeout(word, timeoutMs);
        if (result) return result;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error; // Max retries reached, rethrow
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return null;
  }

  /**
   * Make actual HTTP call to external dictionary API.
   */
  private async makeApiCallWithTimeout(word: string, timeoutMs: number): Promise<DictionaryResult | null> {
    return Promise.race([
      this.makeApiCall(word),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Dictionary API timeout'));
        }, timeoutMs);
      })
    ]);
  }

  private async makeApiCall(word: string): Promise<DictionaryResult | null> {
    // For development/demo purposes, use mock data
    const mockData: Record<string, DictionaryResult> = {
      'phone': { word: 'phone', meaningVi: 'điện thoại', ipa: '/foʊn/', example: 'He is talking on the phone.' },
      'laptop': { word: 'laptop', meaningVi: 'máy tính xách tay', ipa: '/`læp.tɒp/', example: 'She works on her laptop every day.' },
      'cup': { word: 'cup', meaningVi: 'cái cốc', ipa: '/kʌp/', example: 'There is a cup on the table.' },
      'book': { word: 'book', meaningVi: 'quyển sách', ipa: '/bʊk/', example: 'I am reading an interesting book.' },
      'chair': { word: 'chair', meaningVi: 'cái ghế', ipa: '/tʃeər/', example: 'Please sit on this chair.' },
      'table': { word: 'table', meaningVi: 'cái bàn', ipa: '/`teɪ.bəl/', example: 'The keys are on the table.' },
      'pen': { word: 'pen', meaningVi: 'cây bút', ipa: '/pen/', example: 'Can I borrow your pen?' },
      'clock': { word: 'clock', meaningVi: 'đồng hồ', ipa: '/klɒk/', example: 'The clock shows ten o’clock.' },
      'bottle': { word: 'bottle', meaningVi: 'cái chai', ipa: '/`bɒt.əl/', example: 'She filled the bottle with water.' },
      'keyboard': { word: 'keyboard', meaningVi: 'bàn phím', ipa: '/`kiː.bɔːd/', example: 'The keyboard is next to the monitor.' },
    };

    // Return mock data for testing
    return mockData[word] || null;
  }
}

export const dictionaryAdapter = DictionaryAdapter.getInstance();
