import { useQuery } from '@tanstack/react-query';
import { lookupWord } from '@/services/vocabService';
import { Vocabulary } from '@/types/vocabulary';

export function useVocabulary(word: string, enabled = true) {
  return useQuery<Vocabulary, Error>({
    queryKey: ['vocabulary', word],
    queryFn: () => lookupWord(word),
    enabled: enabled && word.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}