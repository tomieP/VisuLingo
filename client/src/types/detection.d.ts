export interface BoundingBox {
  x: number; // 0..1 normalized
  y: number;
  w: number;
  h: number;
}

export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface DetectionResponse {
  imageId: string;
  imageUrl: string;
  objects: DetectedObject[];
  analyzedAt: string;
}

export interface DetectionRequest {
  image: File;
}