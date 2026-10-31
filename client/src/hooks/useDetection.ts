import { useMutation } from '@tanstack/react-query';
import { uploadImage } from '@/services/detectionService';
import { DetectionResponse } from '@/types/detection';

export function useDetection() {
  return useMutation<DetectionResponse, Error, File>({
    mutationFn: uploadImage,
  });
}