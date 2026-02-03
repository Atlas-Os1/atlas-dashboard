import { NextRequest } from 'next/server';
import { TailWorkerClient } from '@/lib/tail-worker-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const scriptName = searchParams.get('script');

  if (!scriptName) {
    return new Response('Missing script parameter', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const client = new TailWorkerClient({
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        apiToken: process.env.CLOUDFLARE_API_TOKEN!,
      });

      try {
        for await (const log of client.streamLogs(scriptName)) {
          const data = encoder.encode(`data: ${JSON.stringify(log)}\n\n`);
          controller.enqueue(data);
        }
      } catch (error) {
        console.error('Stream error:', error);
      } finally {
        client.close();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
