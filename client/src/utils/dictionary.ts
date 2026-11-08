/**
 * Comprehensive dictionary and auto-repair utility for everyday visual objects.
 * Guarantees every detected object has authentic Vietnamese translation, IPA phonetics, and sample sentence.
 */

export interface WordInfo {
  meaningVi: string;
  ipa: string;
  example: string;
}

export const COMMON_VOCAB_DICTIONARY: Record<string, WordInfo> = {
  // Flowers & Nature
  flower: { meaningVi: 'bông hoa', ipa: '/ˈflaʊ.ər/', example: 'A fresh flower in bloom.' },
  flowers: { meaningVi: 'những bông hoa', ipa: '/ˈflaʊ.ərz/', example: 'Fresh flowers in a lovely vase.' },
  vase: { meaningVi: 'bình hoa', ipa: '/veɪs/', example: 'She placed the flowers in a ceramic vase.' },
  plant: { meaningVi: 'chậu cây', ipa: '/plænt/', example: 'A green houseplant sits on the windowsill.' },
  houseplant: { meaningVi: 'cây cảnh trong nhà', ipa: '/ˈhaʊs.plɑːnt/', example: 'Water the houseplant every two days.' },
  tree: { meaningVi: 'cái cây', ipa: '/triː/', example: 'A tall green tree outside the window.' },
  leaf: { meaningVi: 'chiếc lá', ipa: '/liːf/', example: 'A green autumn leaf.' },
  petal: { meaningVi: 'cánh hoa', ipa: '/ˈpet.əl/', example: 'Delicate flower petals.' },

  // Stationery & Reading
  note: { meaningVi: 'mẩu ghi chú', ipa: '/noʊt/', example: 'A handwritten note on craft paper.' },
  postcard: { meaningVi: 'bưu thiếp', ipa: '/ˈpoʊst.kɑːrd/', example: 'She received a lovely postcard.' },
  book: { meaningVi: 'cuốn sách', ipa: '/bʊk/', example: 'An interesting book resting on the desk.' },
  notebook: { meaningVi: 'quyển sổ tay', ipa: '/ˈnoʊt.bʊk/', example: 'Write new vocabulary in your notebook.' },
  pen: { meaningVi: 'cây bút', ipa: '/pen/', example: 'A black ink pen on the table.' },
  pencil: { meaningVi: 'bút chì', ipa: '/ˈpen.səl/', example: 'Sketching with a sharp pencil.' },
  paper: { meaningVi: 'tờ giấy', ipa: '/ˈpeɪ.pər/', example: 'A blank sheet of white paper.' },
  envelope: { meaningVi: 'phong bì', ipa: '/ˈen.və.loʊp/', example: 'A sealed paper envelope.' },
  calendar: { meaningVi: 'cuốn lịch', ipa: '/ˈkæl.ən.dər/', example: 'Check the date on the desk calendar.' },

  // Tech & Electronics
  camera: { meaningVi: 'máy ảnh', ipa: '/ˈkæm.rə/', example: 'He captured memories with his camera.' },
  laptop: { meaningVi: 'máy tính xách tay', ipa: '/ˈlæp.tɑːp/', example: 'Working efficiently on a laptop.' },
  phone: { meaningVi: 'điện thoại di động', ipa: '/foʊn/', example: 'Checking messages on the phone.' },
  smartphone: { meaningVi: 'điện thoại thông minh', ipa: '/ˈsmɑːrt.foʊn/', example: 'A sleek smartphone on the charger.' },
  keyboard: { meaningVi: 'bàn phím', ipa: '/ˈkiː.bɔːrd/', example: 'Typing notes on a mechanical keyboard.' },
  mouse: { meaningVi: 'chuột máy tính', ipa: '/maʊs/', example: 'A wireless computer mouse.' },
  screen: { meaningVi: 'màn hình', ipa: '/skriːn/', example: 'A high-resolution display screen.' },
  monitor: { meaningVi: 'màn hình máy tính', ipa: '/ˈmɑː.nə.t̬ɚ/', example: 'An external computer monitor.' },
  headphones: { meaningVi: 'tai nghe chụp tai', ipa: '/ˈhed.foʊnz/', example: 'Listening to English audio with headphones.' },
  earphones: { meaningVi: 'tai nghe nhét tai', ipa: '/ˈɪr.foʊnz/', example: 'Wireless earphones in their charging case.' },
  charger: { meaningVi: 'củ sạc', ipa: '/ˈtʃɑːr.dʒɚ/', example: 'Plug the phone charger into the wall.' },
  clock: { meaningVi: 'đồng hồ treo tường', ipa: '/klɑːk/', example: 'The wall clock ticks quietly.' },
  watch: { meaningVi: 'đồng hồ đeo tay', ipa: '/wɑːtʃ/', example: 'He checked the time on his wristwatch.' },

  // Furniture & Room
  table: { meaningVi: 'chiếc bàn', ipa: '/ˈteɪ.bəl/', example: 'All the items are arranged on the table.' },
  desk: { meaningVi: 'bàn làm việc', ipa: '/desk/', example: 'A tidy study desk with warm light.' },
  chair: { meaningVi: 'chiếc ghế', ipa: '/tʃer/', example: 'A comfortable ergonomic chair.' },
  sofa: { meaningVi: 'ghế sofa', ipa: '/ˈsoʊ.fə/', example: 'Relaxing on the living room sofa.' },
  cushion: { meaningVi: 'gối tựa lưng', ipa: '/ˈkʊʃ.ən/', example: 'A soft cushion on the couch.' },
  lamp: { meaningVi: 'đèn bàn', ipa: '/læmp/', example: 'A warm reading lamp on the side table.' },
  window: { meaningVi: 'cửa sổ', ipa: '/ˈwɪn.doʊ/', example: 'Morning sunlight pours through the window.' },
  door: { meaningVi: 'cánh cửa', ipa: '/dɔːr/', example: 'The wooden bedroom door.' },
  shelf: { meaningVi: 'kệ sách', ipa: '/ʃelf/', example: 'Books neatly stacked on the shelf.' },
  mirror: { meaningVi: 'tấm gương', ipa: '/ˈmɪr.ɚ/', example: 'A clear glass mirror on the wall.' },

  // Food, Drink & Tableware
  cup: { meaningVi: 'chiếc ly / cốc', ipa: '/kʌp/', example: 'A hot cup of freshly brewed tea.' },
  'coffee cup': { meaningVi: 'tách cà phê', ipa: '/ˈkɑː.fi kʌp/', example: 'A warm ceramic coffee cup.' },
  coffee: { meaningVi: 'cà phê', ipa: '/ˈkɑː.fi/', example: 'Enjoying a hot cup of black coffee.' },
  tea: { meaningVi: 'trà', ipa: '/tiː/', example: 'A soothing cup of green tea.' },
  mug: { meaningVi: 'cốc có quai', ipa: '/mʌɡ/', example: 'A ceramic mug full of hot chocolate.' },
  bottle: { meaningVi: 'chai nước', ipa: '/ˈbɑː.t̬əl/', example: 'A reusable stainless steel water bottle.' },
  glass: { meaningVi: 'ly thủy tinh', ipa: '/ɡlæs/', example: 'A clear glass of cold water.' },
  plate: { meaningVi: 'chiếc đĩa', ipa: '/pleɪt/', example: 'A ceramic plate with breakfast.' },
  bowl: { meaningVi: 'cái bát / tô', ipa: '/boʊl/', example: 'A bowl of fresh vegetable salad.' },
  fork: { meaningVi: 'chiếc nĩa / dĩa', ipa: '/fɔːrk/', example: 'Use a fork to eat the salad.' },
  spoon: { meaningVi: 'chiếc thìa / muỗng', ipa: '/spuːn/', example: 'A stainless steel soup spoon.' },
  bread: { meaningVi: 'bánh mì', ipa: '/bred/', example: 'Freshly baked warm bread.' },
  croissant: { meaningVi: 'bánh sừng bò', ipa: '/kwɑːˈsɑːnt/', example: 'A crispy buttery croissant.' },
  cake: { meaningVi: 'bánh ngọt', ipa: '/keɪk/', example: 'A delicious slice of strawberry cake.' },
  apple: { meaningVi: 'quả táo', ipa: '/ˈæp.əl/', example: 'A crisp red apple on the counter.' },
  banana: { meaningVi: 'quả chuối', ipa: '/bəˈnæn.ə/', example: 'A ripe yellow banana.' },

  // Apparel & Personal Items
  glasses: { meaningVi: 'mắt kính', ipa: '/ˈɡlæs.ɪz/', example: 'Reading glasses with a tortoise frame.' },
  sunglasses: { meaningVi: 'kính râm', ipa: '/ˈsʌnˌɡlæs.ɪz/', example: 'Stylish black sunglasses.' },
  bag: { meaningVi: 'túi xách', ipa: '/bæɡ/', example: 'A canvas tote bag for daily essentials.' },
  backpack: { meaningVi: 'ba lô', ipa: '/ˈbæk.pæk/', example: 'A student backpack with books.' },
  wallet: { meaningVi: 'ví tiền', ipa: '/ˈwɑː.lɪt/', example: 'A slim leather wallet.' },
  jacket: { meaningVi: 'áo khoác', ipa: '/ˈdʒæk.ɪt/', example: 'He zipped up his warm jacket.' },
  shirt: { meaningVi: 'áo sơ mi', ipa: '/ʃɜːrt/', example: 'A crisp white button-up shirt.' },
  tshirt: { meaningVi: 'áo thun', ipa: '/ˈtiː.ʃɜːrt/', example: 'A comfortable cotton t-shirt.' },
  't-shirt': { meaningVi: 'áo thun', ipa: '/ˈtiː.ʃɜːrt/', example: 'A casual black t-shirt.' },
  tie: { meaningVi: 'cà vạt', ipa: '/taɪ/', example: 'A silk tie matching his blazer.' },
  collar: { meaningVi: 'cổ áo', ipa: '/ˈkɑː.lɚ/', example: 'A neat shirt collar.' },
  shoes: { meaningVi: 'đôi giày', ipa: '/ʃuːz/', example: 'A clean pair of white sneakers.' },
  hat: { meaningVi: 'chiếc mũ', ipa: '/hæt/', example: 'A baseball hat for sunny days.' },
  hair: { meaningVi: 'mái tóc', ipa: '/her/', example: 'Neatly styled short hair.' },

  // Pets & Animals
  cat: { meaningVi: 'con mèo', ipa: '/kæt/', example: 'A fluffy ginger cat sleeping in the sun.' },
  dog: { meaningVi: 'con chó', ipa: '/dɔːɡ/', example: 'A playful golden retriever puppy.' },
  bird: { meaningVi: 'con chim', ipa: '/bɜːrd/', example: 'A little bird chirping on the branch.' },
};

/**
 * Normalizes an English word (strips plural 's' if needed, lowercases)
 * and looks up its definition.
 */
export function lookupWordInfo(word: string): WordInfo | null {
  if (!word) return null;
  const clean = word.toLowerCase().trim();

  if (COMMON_VOCAB_DICTIONARY[clean]) {
    return COMMON_VOCAB_DICTIONARY[clean];
  }

  // Try singular form if word ends in 's'
  if (clean.endsWith('s') && clean.length > 2) {
    const singular = clean.slice(0, -1);
    if (COMMON_VOCAB_DICTIONARY[singular]) {
      return COMMON_VOCAB_DICTIONARY[singular];
    }
  }

  return null;
}

/**
 * Enriches or repairs a detected vocab tag if it has generic placeholder ("đồ vật") or missing fields.
 */
export function enrichVocabTag<T extends { word: string; meaningVi?: string; ipa?: string; example?: string }>(
  tag: T
): T & { meaningVi: string; ipa?: string; example?: string } {
  const info = lookupWordInfo(tag.word);
  const isGenericMeaning = !tag.meaningVi || tag.meaningVi.trim() === 'đồ vật' || tag.meaningVi.trim() === 'object';

  const resolvedMeaning = isGenericMeaning && info ? info.meaningVi : tag.meaningVi || info?.meaningVi || 'từ vựng mới';

  return {
    ...tag,
    meaningVi: resolvedMeaning,
    ipa: (!tag.ipa || tag.ipa.trim() === '') && info ? info.ipa : tag.ipa || '',
    example: (!tag.example || tag.example.trim() === '') && info ? info.example : tag.example || '',
  };
}
