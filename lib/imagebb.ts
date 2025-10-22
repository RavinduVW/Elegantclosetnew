/**
 * ImageBB API Integration (LEGACY - Display Only)
 * ⚠️ WARNING: This service is deprecated for NEW uploads
 * Use UploadME service (lib/uploadme.ts) for all new image uploads
 * This module is kept only for displaying existing ImageBB-hosted images
 */

import axios from 'axios';

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export interface ImageBBResponse {
  data: {
    id: string;
    url: string;
    display_url: string;
    delete_url: string;
    thumb: {
      url: string;
    };
    medium: {
      url: string;
    };
  };
  success: boolean;
  status: number;
}

/**
 * Upload image to ImageBB (DEPRECATED - Use uploadToUploadME instead)
 * @deprecated This function is deprecated. Use uploadToUploadME from lib/uploadme.ts
 * @param file Image file to upload
 * @param name Optional name for the image
 * @returns Promise with ImageBB response
 */
export async function uploadToImageBB(
  file: File,
  name?: string
): Promise<ImageBBResponse> {
  console.warn('⚠️ uploadToImageBB is deprecated. Please use uploadToUploadME from lib/uploadme.ts');
  
  if (!IMGBB_API_KEY) {
    throw new Error('ImageBB API key is not configured. Add NEXT_PUBLIC_IMGBB_API_KEY to your .env file');
  }

  try {
    const formData = new FormData();
    formData.append('image', file);
    if (name) {
      formData.append('name', name);
    }

    const response = await axios.post(
      `${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success) {
      throw new Error('Failed to upload image to ImageBB');
    }

    return response.data;
  } catch (error: any) {
    console.error('ImageBB upload error:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to upload image');
  }
}

/**
 * Upload multiple images to ImageBB (DEPRECATED - Use uploadMultipleToUploadME instead)
 * @deprecated This function is deprecated. Use uploadMultipleToUploadME from lib/uploadme.ts
 * @param files Array of image files
 * @param namePrefix Optional prefix for image names
 * @returns Promise with array of image URLs
 */
export async function uploadMultipleToImageBB(
  files: File[],
  namePrefix?: string
): Promise<string[]> {
  console.warn('⚠️ uploadMultipleToImageBB is deprecated. Please use uploadMultipleToUploadME from lib/uploadme.ts');
  const uploadPromises = files.map((file, index) => {
    const name = namePrefix ? `${namePrefix}_${index + 1}` : undefined;
    return uploadToImageBB(file, name);
  });

  const results = await Promise.all(uploadPromises);
  return results.map(result => result.data.display_url);
}

/**
 * Convert base64 or blob to File for upload
 * @param dataUrl Base64 data URL or blob URL
 * @param fileName Name for the file
 * @returns File object
 */
export function dataURLtoFile(dataUrl: string, fileName: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}
