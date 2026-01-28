import { NextRequest, NextResponse } from 'next/server';
import { getMCPAggregator } from '@/lib/mcp/aggregator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scriptName = searchParams.get('script');
    
    const aggregator = getMCPAggregator();
    const data = await aggregator.getObservabilityData(scriptName || undefined);
    
    return NextResponse.json({
      success: true,
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching observability data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch observability data',
      },
      { status: 500 }
    );
  }
}
