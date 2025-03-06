// app/api/process/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const response = await fetch('http://10.1.40.19:81/process/', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Error processing document' }, 
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' }, 
      { status: 500 }
    );
  }
}