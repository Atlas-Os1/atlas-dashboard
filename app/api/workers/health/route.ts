import { NextResponse } from 'next/server';
import { workerService } from '@/lib/worker-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const workers = await workerService.getAllWorkersWithMetrics();
    
    const health = {
      totalWorkers: workers.length,
      healthy: workers.filter((w) => w.status === 'healthy').length,
      warning: workers.filter((w) => w.status === 'warning').length,
      error: workers.filter((w) => w.status === 'error').length,
      totalRequests24h: workers.reduce((sum, w) => sum + w.requests24h, 0),
      totalErrors24h: workers.reduce((sum, w) => sum + w.errors24h, 0),
      avgErrorRate: workers.length > 0 
        ? workers.reduce((sum, w) => sum + w.errorRate, 0) / workers.length 
        : 0,
      workers: workers.map((w) => ({
        name: w.name,
        status: w.status,
        errorRate: w.errorRate,
        requests24h: w.requests24h,
      })),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Error fetching worker health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch worker health' },
      { status: 500 }
    );
  }
}
