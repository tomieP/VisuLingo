import { useState, useCallback } from 'react';
import { useDetection } from '@/hooks/useDetection';
import { useVocabulary } from '@/hooks/useVocabulary';
import { UploadImage } from '@/components/detection/UploadImage';
import { BoundingBoxOverlay } from '@/components/detection/BoundingBoxOverlay';
import { ObjectList } from '@/components/detection/ObjectList';
import { VocabCard } from '@/components/vocabulary/VocabCard';
import { Loading } from '@/components/common/Loading';
import { DetectionResponse, DetectedObject } from '@/types/detection';

function HomePage() {
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const { mutate: analyzeImage, isPending: isAnalyzing } = useDetection();
  const { data: vocab, isPending: isLookingUp } = useVocabulary(selectedObject?.label ?? '', !!selectedObject);

  const handleUpload = useCallback((file: File) => {
    setImageUrl(URL.createObjectURL(file));
    setDetectionResult(null);
    setSelectedObject(null);
    analyzeImage(file, {
      onSuccess: (data) => {
        setDetectionResult(data);
      },
      onError: (error) => {
        console.error('Detection failed:', error);
        alert('Failed to analyze image. Please try again.');
      },
    });
  }, [analyzeImage]);

  const handleObjectSelect = (object: DetectedObject) => {
    setSelectedObject(object);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    setContainerSize({ width: target.naturalWidth, height: target.naturalHeight });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">VisuLingo</h1>
          <p className="text-gray-500 mt-1">Learn English from everyday images with AI</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload & Image Panel */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <UploadImage onUpload={handleUpload} isLoading={isAnalyzing} />
            </section>

            {imageUrl && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Analysis Result</h2>
                <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {isAnalyzing && detectionResult === null ? (
                    <div className="flex items-center justify-center h-96">
                      <Loading message="AI is analyzing the image..." />
                    </div>
                  ) : (
                    <>
                      <img
                        src={imageUrl}
                        alt="Analyzed image"
                        onLoad={handleImageLoad}
                        className="w-full h-auto"
                      />
                      {detectionResult && containerSize.width > 0 && (
                        <BoundingBoxOverlay
                          imageUrl={imageUrl}
                          objects={detectionResult.objects}
                          containerWidth={containerSize.width}
                          containerHeight={containerSize.height}
                          onObjectClick={handleObjectSelect}
                          selectedObjectId={selectedObject?.id}
                        />
                      )}
                    </>
                  )}
                </div>
              </section>
            )}

            {selectedObject && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Vocabulary</h2>
                {isLookingUp ? (
                  <Loading message="Looking up word..." />
                ) : vocab ? (
                  <VocabCard vocab={vocab} imageId={detectionResult?.imageId} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Could not find vocabulary for "{selectedObject.label}"</p>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Object List Sidebar */}
          <div className="lg:col-span-1">
            <section className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              {detectionResult ? (
                <ObjectList
                  objects={detectionResult.objects}
                  onSelect={handleObjectSelect}
                  selectedObjectId={selectedObject?.id}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Upload an image to detect objects</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;