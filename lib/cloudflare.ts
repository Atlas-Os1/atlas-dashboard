import { CloudflareWorker, AnalyticsData, LogEntry } from '@/types';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

interface CloudflareResponse<T> {
  success: boolean;
  errors: any[];
  messages: any[];
  result: T;
}

class CloudflareClient {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${CLOUDFLARE_API_BASE}${endpoint}`, {
      headers: this.headers,
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`);
    }

    const data: CloudflareResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
    }

    return data.result;
  }

  async listWorkers(): Promise<CloudflareWorker[]> {
    try {
      const result = await this.fetch<CloudflareWorker[]>(
        `/accounts/${ACCOUNT_ID}/workers/scripts`
      );
      return result;
    } catch (error) {
      console.error('Error fetching workers:', error);
      return [];
    }
  }

  async getWorkerAnalytics(scriptName: string, since?: Date): Promise<AnalyticsData | null> {
    try {
      const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
      const untilDate = new Date();
      
      const sinceParam = sinceDate.toISOString();
      const untilParam = untilDate.toISOString();

      const result = await this.fetch<AnalyticsData>(
        `/accounts/${ACCOUNT_ID}/workers/scripts/${scriptName}/analytics?since=${sinceParam}&until=${untilParam}`
      );
      
      return result;
    } catch (error) {
      console.error(`Error fetching analytics for ${scriptName}:`, error);
      return null;
    }
  }

  async getAccountAnalytics(since?: Date): Promise<any> {
    try {
      const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000);
      const untilDate = new Date();
      
      const result = await this.fetch<any>(
        `/accounts/${ACCOUNT_ID}/analytics_engine/sql`
      );
      
      return result;
    } catch (error) {
      console.error('Error fetching account analytics:', error);
      return null;
    }
  }

  async getWorkerLogs(scriptName: string, limit: number = 100): Promise<LogEntry[]> {
    try {
      // Note: This endpoint might require Logpush or Tail Workers
      // For now, returning empty array - implement when API access is available
      console.warn('Worker logs API not yet implemented');
      return [];
    } catch (error) {
      console.error(`Error fetching logs for ${scriptName}:`, error);
      return [];
    }
  }

  async getZones(): Promise<any[]> {
    try {
      const result = await this.fetch<any[]>(
        `/zones?account.id=${ACCOUNT_ID}`
      );
      return result;
    } catch (error) {
      console.error('Error fetching zones:', error);
      return [];
    }
  }
}

export const cloudflare = new CloudflareClient();
