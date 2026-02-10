// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { gateway } from '@/lib/gateway/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionKey, agentId, message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const response = await gateway.sendMessage({ sessionKey, agentId, message });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
