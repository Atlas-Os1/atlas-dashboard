// lib/gateway/client.ts

import { config } from '../config';
import type {
  GatewaySession,
  GatewayStatus,
  SendMessageRequest,
  SendMessageResponse,
  GatewayMessage,
} from './types';

class GatewayClient {
  private get baseUrl() {
    return config.gateway.httpUrl;
  }

  private get token() {
    return config.gateway.token;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gateway API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  async getStatus(): Promise<GatewayStatus> {
    return this.fetch<GatewayStatus>('/api/status');
  }

  async listSessions(): Promise<GatewaySession[]> {
    return this.fetch<GatewaySession[]>('/api/sessions');
  }

  async getSessionHistory(sessionKey: string, limit = 50): Promise<GatewayMessage[]> {
    return this.fetch<GatewayMessage[]>(
      `/api/sessions/${encodeURIComponent(sessionKey)}/messages?limit=${limit}`
    );
  }

  async sendMessage(req: SendMessageRequest): Promise<SendMessageResponse> {
    return this.fetch<SendMessageResponse>('/api/sessions/send', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }
}

export const gateway = new GatewayClient();
