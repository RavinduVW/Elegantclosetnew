import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: { 
        code: 'DEPRECATED', 
        message: 'This API route is deprecated. All image uploads now use Firebase Storage directly from the client.' 
      } 
    },
    { status: 410 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      message: 'Image upload API - Deprecated',
      info: 'This API route is no longer in use. All image uploads are now handled directly through Firebase Storage.',
      migration: 'Use the uploadToFirebaseStorage function from lib/firebase-storage.ts'
    },
    { status: 200 }
  );
}
