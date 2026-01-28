import { NextRequest, NextResponse } from 'next/server';
import { getMCPAggregator } from '@/lib/mcp/aggregator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    const aggregator = getMCPAggregator();
    const builds = await aggregator.getBuildHistory(limit);
    
    return NextResponse.json({
      success: true,
      data: builds,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching build history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch build history',
      },
      { status: 500 }
    );
  }
}
