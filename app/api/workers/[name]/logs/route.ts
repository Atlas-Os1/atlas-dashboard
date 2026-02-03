import { NextRequest, NextResponse } from 'next/server';
import { getWorkerEvents, type LogsQueryParams } from '@/lib/cloudflare-logs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const url = new URL(request.url);

    const queryParams: LogsQueryParams = {
      scriptName: name === 'all' ? undefined : name,
      level: url.searchParams.get('level') || undefined,
      since: url.searchParams.get('since') || undefined,
      until: url.searchParams.get('until') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '100'),
      search: url.searchParams.get('search') || undefined,
      outcome: url.searchParams.get('outcome') || undefined,
    };

    const logs = await getWorkerEvents(queryParams);

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
      params: {
        scriptName: queryParams.scriptName || 'all',
        since: queryParams.since,
        until: queryParams.until,
      },
    });
  } catch (error) {
    console.error('Error fetching worker logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch logs',
        data: [],
      },
      { status: 500 }
    );
  }
}
