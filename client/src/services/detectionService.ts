import api from './api';
import { DetectionResponse } from '@/types/detection';

export async function uploadImage(file: File): Promise<DetectionResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<DetectionResponse>('/detection/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}