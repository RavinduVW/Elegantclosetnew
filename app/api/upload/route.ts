import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const UPLOADME_API_KEY = process.env.NEXT_PUBLIC_UPLOADME_API_KEY || '';
const UPLOADME_UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOADME_UPLOAD_URL || 'https://freeimage.host/api/1/upload';

export async function POST(request: NextRequest) {
  try {
    if (!UPLOADME_API_KEY) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_API_KEY', message: 'UploadME API key is not configured' } },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_FILE', message: 'No file provided' } },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const uploadFormData = new FormData();
    uploadFormData.append('key', UPLOADME_API_KEY);
    uploadFormData.append('source', base64);
    uploadFormData.append('format', 'json');

    console.log('Uploading to FreeImage.host...');
    const response = await axios.post(UPLOADME_UPLOAD_URL, uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });

    console.log('FreeImage.host response status:', response.status);
    console.log('FreeImage.host response data:', JSON.stringify(response.data, null, 2));

    if (!response.data) {
      console.error('Upload failed - no response data');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'UPLOAD_FAILED', 
            message: 'No response from image hosting service' 
          } 
        },
        { status: 500 }
      );
    }

    const statusCode = parseInt(String(response.data.status_code || response.data.statusCode || 0));
    if (statusCode !== 200 && response.data.status_txt !== 'OK') {
      console.error('Upload failed - bad status:', statusCode, response.data.status_txt);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'UPLOAD_FAILED', 
            message: response.data?.error?.message || response.data?.status_txt || 'Failed to upload image' 
          } 
        },
        { status: 500 }
      );
    }

    const imageData = response.data.image;
    console.log('Extracted image data:', imageData);

    const displayUrl = imageData.display_url || imageData.url || imageData.image?.url || '';
    console.log('Final display_url to be returned:', displayUrl);

    if (!displayUrl) {
      console.error('No display URL found in response - image data:', imageData);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'NO_URL', 
            message: 'Image uploaded but no URL was returned from the service' 
          } 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: imageData.id || imageData.id_encoded || '',
        url: imageData.url || imageData.image?.url || '',
        display_url: displayUrl,
        thumbnail_url: imageData.thumb?.url || imageData.thumbnail?.url || '',
        medium_url: imageData.medium?.url || '',
        delete_url: imageData.delete_url || '',
        filename: imageData.filename || imageData.name || file.name,
        size: imageData.size || file.size,
        width: imageData.width || 0,
        height: imageData.height || 0,
        mime_type: imageData.mime || file.type,
      }
    });

  } catch (error: any) {
    console.error('Upload API error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
          { status: 401 }
        );
      } else if (error.response?.status === 413) {
        return NextResponse.json(
          { success: false, error: { code: 'FILE_TOO_LARGE', message: 'File size too large' } },
          { status: 413 }
        );
      } else if (error.response?.status === 429) {
        return NextResponse.json(
          { success: false, error: { code: 'RATE_LIMIT', message: 'Rate limit exceeded' } },
          { status: 429 }
        );
      } else if (error.response?.data) {
        console.error('API error response:', error.response.data);
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'API_ERROR', 
              message: error.response.data.error?.message || error.response.data.status_txt || 'Upload failed' 
            } 
          },
          { status: error.response.status || 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: error.message || 'Internal server error' 
        } 
      },
      { status: 500 }
    );
  }
}
