import api from './api';
import { Vocabulary } from '@/types/vocabulary';

export async function lookupWord(word: string): Promise<Vocabulary> {
  const response = await api.get<Vocabulary>(`/vocabulary/lookup?word=${encodeURIComponent(word)}`);
  return response.data;
}