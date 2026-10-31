import { useState } from 'react';
import { DetectedObject } from '@/types/detection';
import { Volume2, Sparkles, Search, Layers } from 'lucide-react';
import { speakWord } from '@/utils/speech';

interface ObjectListProps {
  objects: DetectedObject[];
  onSelect: (object: DetectedObject) => void;
  selectedObjectId?: string;
  onHover?: (objectId: string | null) => void;
}

export function ObjectList({ objects, onSelect, selectedObjectId, onHover }: ObjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (objects.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">Chưa phát hiện vật thể nào</p>
      </div>
    );
  }

  const filtered = objects.filter((obj) =>
    obj.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Header & Count */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="font-bold text-slate-900 text-sm">
            Vật thể phát hiện ({objects.length})
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Bấm để học từ</span>
      </div>

      {/* Mini search filter if >= 4 objects */}
      {objects.length >= 4 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Lọc từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-all"
          />
        </div>
      )}

      {/* List items */}
      <ul className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
        {filtered.map((obj) => {
          const isSelected = selectedObjectId === obj.id;
          const isHigh = obj.confidence >= 0.85;

          return (
            <li key={obj.id}>
              <div
                onClick={() => onSelect(obj)}
                onMouseEnter={() => onHover?.(obj.id)}
                onMouseLeave={() => onHover?.(null)}
                className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-300 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full transition-transform group-hover:scale-125 ${
                      isSelected
                        ? 'bg-blue-600'
                        : isHigh
                        ? 'bg-emerald-500'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold capitalize truncate ${
                      isSelected ? 'text-blue-900 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {obj.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Quick Audio button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(obj.label);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Phát âm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Confidence pill */}
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isHigh
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    {Math.round(obj.confidence * 100)}%
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
