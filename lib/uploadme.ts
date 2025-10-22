/**
 * UploadME API Integration (Chevereto)
 * Secure image hosting service with original quality preservation
 * Documentation: https://chevereto.com/docs/api
 */

import axios from 'axios';

const UPLOADME_API_KEY = process.env.NEXT_PUBLIC_UPLOADME_API_KEY || '';
const UPLOADME_UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOADME_UPLOAD_URL || 'https://freeimage.host/api/1/upload';
const UPLOADME_DELETE_URL = process.env.NEXT_PUBLIC_UPLOADME_DELETE_URL || 'https://freeimage.host/api/1/delete';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];

export interface UploadMEResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
    display_url: string;
    thumbnail_url?: string;
    medium_url?: string;
    delete_url?: string;
    filename: string;
    size: number;
    width?: number;
    height?: number;
    mime_type: string;
  };
  message?: string;
}

export interface UploadMEError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Validate file before upload
 * @param file File to validate
 * @throws Error if validation fails
 */
export function validateImageFile(file: File): void {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (file.size === 0) {
    throw new Error('File is empty');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(`File extension ${extension} is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  if (!/^[\w\-. ]+$/.test(file.name)) {
    throw new Error('Filename contains invalid characters');
  }
}

/**
 * Sanitize filename for safe storage
 * @param filename Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^\w\-. ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
    .substring(0, 200);
}

/**
 * Upload image to UploadME with original quality preservation
 * Uses Next.js API route to bypass CORS restrictions
 * @param file Image file to upload
 * @param options Upload options
 * @returns Promise with UploadME response
 */
export async function uploadToUploadME(
  file: File,
  options?: {
    name?: string;
    folder?: string;
    quality?: number;
    preserveOriginal?: boolean;
    tags?: string[];
  }
): Promise<UploadMEResponse> {
  if (!UPLOADME_API_KEY) {
    throw new Error('UploadME API key is not configured. Add NEXT_PUBLIC_UPLOADME_API_KEY to your .env file');
  }

  try {
    validateImageFile(file);

    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.folder) {
      formData.append('folder', options.folder);
    }
    if (options?.name) {
      formData.append('name', options.name);
    }

    console.log('Uploading file via /api/upload:', file.name, file.size);
    
    const response = await axios.post(
      '/api/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
        maxContentLength: MAX_FILE_SIZE,
        maxBodyLength: MAX_FILE_SIZE,
      }
    );

    console.log('Upload response received:', response.status, response.data);

    if (!response.data || !response.data.success) {
      console.error('Upload failed - response:', response.data);
      throw new Error(response.data?.error?.message || 'Failed to upload image to UploadME');
    }

    console.log('Upload successful - display_url:', response.data.data?.display_url);
    return response.data as UploadMEResponse;
  } catch (error: any) {
    console.error('UploadME upload error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your UploadME credentials.');
      } else if (error.response?.status === 413) {
        throw new Error('File size too large for upload.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
    }
    
    throw new Error(error.message || 'Failed to upload image. Please try again.');
  }
}

/**
 * Upload multiple images to UploadME
 * @param files Array of image files
 * @param options Upload options
 * @returns Promise with array of image URLs
 */
export async function uploadMultipleToUploadME(
  files: File[],
  options?: {
    namePrefix?: string;
    folder?: string;
    quality?: number;
    preserveOriginal?: boolean;
    tags?: string[];
    parallel?: boolean;
  }
): Promise<string[]> {
  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  if (files.length > 50) {
    throw new Error('Maximum 50 files can be uploaded at once');
  }

  const { parallel = true, namePrefix, ...uploadOptions } = options || {};

  if (parallel) {
    const uploadPromises = files.map((file, index) => {
      const name = namePrefix ? `${namePrefix}_${index + 1}` : file.name;
      return uploadToUploadME(file, { ...uploadOptions, name });
    });

    const results = await Promise.all(uploadPromises);
    return results.map(result => result.data.display_url);
  } else {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = namePrefix ? `${namePrefix}_${i + 1}` : file.name;
      const result = await uploadToUploadME(file, { ...uploadOptions, name });
      urls.push(result.data.display_url);
    }
    return urls;
  }
}

/**
 * Delete image from UploadME
 * @param imageId Image ID or delete URL
 * @returns Promise with success status
 */
export async function deleteFromUploadME(imageId: string): Promise<boolean> {
  if (!UPLOADME_API_KEY) {
    throw new Error('UploadME API key is not configured');
  }

  try {
    const response = await axios.delete(
      `${UPLOADME_DELETE_URL}/${imageId}`,
      {
        headers: {
          'Authorization': `Bearer ${UPLOADME_API_KEY}`,
          'X-Upload-Client': 'elegant-closet',
        },
        timeout: 30000,
      }
    );

    return response.data.success === true;
  } catch (error: any) {
    console.error('UploadME delete error:', error);
    return false;
  }
}

/**
 * Check if a URL is from UploadME service (Chevereto/FreeImage.host)
 * @param url Image URL to check
 * @returns True if URL is from UploadME
 */
export function isUploadMEUrl(url: string): boolean {
  return url.includes('freeimage.host') || 
         url.includes('iili.io') || 
         url.includes('uploadme.com') || 
         url.includes('upload.me');
}

/**
 * Check if a URL is from ImageBB service (legacy)
 * @param url Image URL to check
 * @returns True if URL is from ImageBB
 */
export function isImageBBUrl(url: string): boolean {
  return url.includes('ibb.co') || url.includes('imgbb.com');
}

/**
 * Get image service type from URL
 * @param url Image URL
 * @returns Service type
 */
export function getImageServiceType(url: string): 'uploadme' | 'imagebb' | 'unknown' {
  if (isUploadMEUrl(url)) return 'uploadme';
  if (isImageBBUrl(url)) return 'imagebb';
  return 'unknown';
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
  
  return new File([u8arr], sanitizeFilename(fileName), { type: mime });
}

/**
 * Compress image client-side before upload (optional)
 * @param file Original file
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @param quality Quality (0-1)
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 2000,
  maxHeight: number = 2000,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
