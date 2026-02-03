// app/api/chat/[sessionKey]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { gateway } from '@/lib/gateway/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionKey: string }> }
) {
  try {
    const { sessionKey } = await params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const messages = await gateway.getSessionHistory(sessionKey, limit);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch session history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
