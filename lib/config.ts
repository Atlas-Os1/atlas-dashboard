// lib/config.ts

export const config = {
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || 'ff3c5e2beaea9f85fee3200bfe28da16',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
  },
  gateway: {
    url: process.env.GATEWAY_URL || 'ws://localhost:18789',
    httpUrl: process.env.GATEWAY_HTTP_URL || 'http://localhost:18789',
    token: process.env.GATEWAY_TOKEN || '',
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
  },
} as const;

export function validateConfig(): string[] {
  const missing: string[] = [];
  if (!config.cloudflare.apiToken) missing.push('CLOUDFLARE_API_TOKEN');
  if (!config.gateway.token) missing.push('GATEWAY_TOKEN');
  return missing;
}
