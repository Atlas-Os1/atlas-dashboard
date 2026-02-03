// app/api/sessions/route.ts
import { NextResponse } from 'next/server';
import { gateway } from '@/lib/gateway/client';

export async function GET() {
  try {
    const sessions = await gateway.listSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
