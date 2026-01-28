import { NextRequest, NextResponse } from 'next/server';
import { getElevenLabsClient } from '@/lib/voice/elevenlabs';
import { calculateSystemHealth } from '@/lib/data-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Missing text parameter' },
        { status: 400 }
      );
    }

    const client = getElevenLabsClient();
    const command = client.parseCommand(text);

    // Gather data based on command intent
    let data: any = {};
    
    if (command.action === 'get_health') {
      data.health = await calculateSystemHealth();
    } else if (command.action === 'get_errors') {
      const health = await calculateSystemHealth();
      data.errors = health.totalErrors;
    } else if (command.action === 'get_projects') {
      const health = await calculateSystemHealth();
      data.projectCount = health.activeProjects;
    }

    const response = await client.generateResponse(command, data);

    return NextResponse.json({
      success: true,
      command,
      response,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Voice command error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process voice command',
      },
      { status: 500 }
    );
  }
}
