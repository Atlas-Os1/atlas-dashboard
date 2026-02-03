// lib/gateway/types.ts

export interface GatewaySession {
  sessionKey: string;
  kind: string;
  channel: string;
  agentId: string;
  label?: string;
  lastActivity?: string;
  messages?: GatewayMessage[];
}

export interface GatewayMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  toolCalls?: unknown[];
}

export interface GatewayStatus {
  version: string;
  uptime: number;
  agents: string[];
  sessions: number;
}

export interface SendMessageRequest {
  sessionKey?: string;
  agentId?: string;
  message: string;
}

export interface SendMessageResponse {
  sessionKey: string;
  response: string;
}
