import { NextResponse } from 'next/server';
import { getMCPAggregator } from '@/lib/mcp/aggregator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const aggregator = getMCPAggregator();
    const metrics = await aggregator.getAggregatedMetrics();
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching aggregated metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
      },
      { status: 500 }
    );
  }
}
