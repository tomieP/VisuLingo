export interface DictionaryResult {
  word: string;
  meaningVi: string;
  ipa: string;
  example: string;
}

const MOCK_DICTIONARY: Record<string, DictionaryResult> = {
  laptop: { word: 'laptop', meaningVi: 'máy tính xách tay', ipa: '/ˈlæp.tɒp/', example: 'She works on her laptop every day.' },
  'coffee cup': { word: 'coffee cup', meaningVi: 'cốc cà phê', ipa: '/ˈkɒf.i kʌp/', example: 'He picked up his coffee cup.' },
  cup: { word: 'cup', meaningVi: 'cái cốc', ipa: '/kʌp/', example: 'There is a cup on the table.' },
  book: { word: 'book', meaningVi: 'quyển sách', ipa: '/bʊk/', example: 'I am reading an interesting book.' },
  phone: { word: 'phone', meaningVi: 'điện thoại', ipa: '/fəʊn/', example: 'My phone is on the desk.' },
  chair: { word: 'chair', meaningVi: 'cái ghế', ipa: '/tʃeər/', example: 'Please sit on this chair.' },
  table: { word: 'table', meaningVi: 'cái bàn', ipa: '/ˈteɪ.bəl/', example: 'The keys are on the table.' },
  pen: { word: 'pen', meaningVi: 'cây bút', ipa: '/pen/', example: 'Can I borrow your pen?' },
  clock: { word: 'clock', meaningVi: 'đồng hồ', ipa: '/klɒk/', example: 'The clock shows ten o’clock.' },
  bottle: { word: 'bottle', meaningVi: 'cái chai', ipa: '/ˈbɒt.əl/', example: 'She filled the bottle with water.' },
  keyboard: { word: 'keyboard', meaningVi: 'bàn phím', ipa: '/ˈkiː.bɔːd/', example: 'The keyboard is next to the monitor.' },
};

export class DictionaryAdapter {
  async lookup(word: string): Promise<DictionaryResult | null> {
    // Production integration point: GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}
    const normalized = word.trim().toLowerCase();
    return MOCK_DICTIONARY[normalized] ?? null;
  }
}

export const dictionaryAdapter = new DictionaryAdapter();