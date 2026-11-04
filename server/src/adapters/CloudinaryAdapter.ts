import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  storageKey: string;
  secureUrl: string;
}

/**
 * Cloudinary storage adapter for image uploads and management.
 * Handles image buffering, thumbnail generation, and cleanup operations.
 */
export class CloudinaryAdapter {
  private static instance: CloudinaryAdapter;

  private constructor() {
    // Configure Cloudinary with environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    });
  }

  public static getInstance(): CloudinaryAdapter {
    if (!CloudinaryAdapter.instance) {
      CloudinaryAdapter.instance = new CloudinaryAdapter();
    }
    return CloudinaryAdapter.instance;
  }

  /**
   * Upload image buffer to Cloudinary and generate thumbnail.
   * @param buffer - Image buffer to upload
   * @param folder - Target folder for storage (e.g., 'user_uploads', 'analysis_images')
   * @returns Promise<CloudinaryUploadResult> with storageKey and secureUrl
   */
  public async uploadImageBuffer(buffer: Buffer, folder: string): Promise<CloudinaryUploadResult> {
    try {
      // Upload original image
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [{ width: 320, height: 320, crop: 'limit' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Convert buffer to readable stream
        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
      });

      return {
        storageKey: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
      };
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error;
    }
  }

  /**
   * Delete image from Cloudinary by public ID.
   * @param publicId - The public ID (storageKey) of the image to delete
   */
  public async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });
    } catch (error) {
      console.error('Cloudinary deletion failed:', error);
      throw error;
    }
  }

  /**
   * Generate thumbnail for an existing image.
   * @param publicId - The public ID of the original image
   * @param folder - Folder where image is stored
   * @returns Promise<CloudinaryUploadResult> with thumbnail details
   */
  public async generateThumbnail(publicId: string, folder: string): Promise<CloudinaryUploadResult> {
    try {
      const thumbnailResult = await cloudinary.url(publicId, {
        folder,
        resource_type: 'image',
        transformation: [{ width: 320, height: 320, crop: 'thumb', gravity: 'auto' }],
      });

      return {
        storageKey: `${publicId}_thumb`,
        secureUrl: thumbnailResult,
      };
    } catch (error) {
      console.error('Cloudinary thumbnail generation failed:', error);
      throw error;
    }
  }
}

export const cloudinaryAdapter = CloudinaryAdapter.getInstance();