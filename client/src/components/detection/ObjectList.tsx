import { DetectedObject } from '@/types/detection';

interface ObjectListProps {
  objects: DetectedObject[];
  onSelect: (object: DetectedObject) => void;
  selectedObjectId?: string;
}

export function ObjectList({ objects, onSelect, selectedObjectId }: ObjectListProps) {
  if (objects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No objects detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900">Detected Objects ({objects.length})</h3>
      <ul className="space-y-1 max-h-64 overflow-y-auto">
        {objects.map((obj) => (
          <li key={obj.id}>
            <button
              onClick={() => onSelect(obj)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedObjectId === obj.id
                  ? 'bg-blue-50 border-l-4 border-blue-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{obj.label}</span>
                <span
                  className={`text-sm px-2 py-0.5 rounded-full ${
                    obj.confidence >= 0.8
                      ? 'bg-green-100 text-green-800'
                      : obj.confidence >= 0.5
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {Math.round(obj.confidence * 100)}%
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}