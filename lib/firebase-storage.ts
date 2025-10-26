import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll,
  UploadTaskSnapshot,
  StorageReference
} from "firebase/storage";
import { app } from "@/backend/config";

const storage = getStorage(app);

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/avif',
  'image/heic',
  'image/heif'
];

const ALLOWED_EXTENSIONS = [
  '.jpg', 
  '.jpeg', 
  '.png', 
  '.gif', 
  '.webp', 
  '.svg', 
  '.bmp',
  '.avif',
  '.heic',
  '.heif'
];

export interface FirebaseStorageResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
    fullPath: string;
    name: string;
    size: number;
    contentType: string;
    timeCreated: string;
  };
  message?: string;
}

export interface FirebaseStorageError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

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
    throw new Error(
      `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }

  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `File extension ${extension} is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  if (!/^[\w\-. ]+$/.test(file.name)) {
    throw new Error('Filename contains invalid characters');
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^\w\-. ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
    .substring(0, 200);
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = sanitizeFilename(originalName);
  const extension = sanitized.substring(sanitized.lastIndexOf('.'));
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
  
  return `${nameWithoutExt}_${timestamp}_${random}${extension}`;
}

export async function uploadToFirebaseStorage(
  file: File,
  options?: {
    folder?: string;
    customName?: string;
    onProgress?: (progress: UploadProgress) => void;
  }
): Promise<FirebaseStorageResponse> {
  try {
    validateImageFile(file);

    const folder = options?.folder || 'media';
    const filename = options?.customName 
      ? sanitizeFilename(options.customName)
      : generateUniqueFilename(file.name);
    
    const filePath = `${folder}/${filename}`;
    const storageRef = ref(storage, filePath);

    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    };

    console.log(`Uploading to Firebase Storage: ${filePath}`);

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          
          if (options?.onProgress) {
            options.onProgress({
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress,
            });
          }

          console.log(`Upload progress: ${progress.toFixed(2)}%`);
        },
        (error) => {
          console.error('Firebase Storage upload error:', error);
          
          let errorMessage = 'Failed to upload image';
          
          if (error.code === 'storage/unauthorized') {
            errorMessage = 'Unauthorized: You do not have permission to upload files';
          } else if (error.code === 'storage/canceled') {
            errorMessage = 'Upload was canceled';
          } else if (error.code === 'storage/quota-exceeded') {
            errorMessage = 'Storage quota exceeded';
          } else if (error.code === 'storage/invalid-checksum') {
            errorMessage = 'File upload was corrupted. Please try again';
          } else if (error.code === 'storage/retry-limit-exceeded') {
            errorMessage = 'Upload timeout. Please check your connection and try again';
          }
          
          reject(new Error(errorMessage));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const metadata = uploadTask.snapshot.metadata;

            console.log('Upload successful:', downloadURL);

            resolve({
              success: true,
              data: {
                id: metadata.fullPath,
                url: downloadURL,
                fullPath: metadata.fullPath,
                name: metadata.name,
                size: metadata.size,
                contentType: metadata.contentType || file.type,
                timeCreated: metadata.timeCreated,
              },
            });
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(new Error('Upload completed but failed to retrieve download URL'));
          }
        }
      );
    });
  } catch (error: any) {
    console.error('Firebase Storage upload error:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
}

export async function uploadMultipleToFirebaseStorage(
  files: File[],
  options?: {
    folder?: string;
    namePrefix?: string;
    onProgress?: (fileIndex: number, progress: UploadProgress) => void;
    parallel?: boolean;
  }
): Promise<FirebaseStorageResponse[]> {
  const uploadOptions = {
    folder: options?.folder || 'media',
  };

  if (options?.parallel !== false) {
    const uploadPromises = files.map((file, index) => {
      const customName = options?.namePrefix 
        ? `${options.namePrefix}_${index + 1}${file.name.substring(file.name.lastIndexOf('.'))}`
        : undefined;

      return uploadToFirebaseStorage(file, {
        ...uploadOptions,
        customName,
        onProgress: options?.onProgress 
          ? (progress) => options.onProgress!(index, progress)
          : undefined,
      });
    });

    return Promise.all(uploadPromises);
  } else {
    const results: FirebaseStorageResponse[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const customName = options?.namePrefix 
        ? `${options.namePrefix}_${i + 1}${file.name.substring(file.name.lastIndexOf('.'))}`
        : undefined;

      const result = await uploadToFirebaseStorage(file, {
        ...uploadOptions,
        customName,
        onProgress: options?.onProgress 
          ? (progress) => options.onProgress!(i, progress)
          : undefined,
      });
      
      results.push(result);
    }
    
    return results;
  }
}

export async function deleteFromFirebaseStorage(
  filePath: string
): Promise<{ success: boolean; message: string }> {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    
    console.log(`Successfully deleted: ${filePath}`);
    
    return {
      success: true,
      message: 'File deleted successfully',
    };
  } catch (error: any) {
    console.error('Firebase Storage delete error:', error);
    
    if (error.code === 'storage/object-not-found') {
      return {
        success: false,
        message: 'File not found',
      };
    }
    
    return {
      success: false,
      message: error.message || 'Failed to delete file',
    };
  }
}

export async function listFilesInFolder(
  folder: string
): Promise<{ files: StorageReference[]; folders: StorageReference[] }> {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    
    return {
      files: result.items,
      folders: result.prefixes,
    };
  } catch (error: any) {
    console.error('Firebase Storage list error:', error);
    throw new Error(error.message || 'Failed to list files');
  }
}

export async function getFileMetadata(filePath: string) {
  try {
    const storageRef = ref(storage, filePath);
    const url = await getDownloadURL(storageRef);
    
    return {
      url,
      fullPath: filePath,
    };
  } catch (error: any) {
    console.error('Firebase Storage metadata error:', error);
    throw new Error(error.message || 'Failed to get file metadata');
  }
}

export { storage };
