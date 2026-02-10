// lib/config.ts

export const config = {
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || 'ff3c5e2beaea9f85fee3200bfe28da16',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
  },
  // Flo Gateway (VPS main agent)
  floGateway: {
    url: process.env.FLO_GATEWAY_URL || 'wss://gateway.minte.dev',
    httpUrl: process.env.FLO_GATEWAY_HTTP_URL || 'https://gateway.minte.dev',
    token: process.env.FLO_GATEWAY_TOKEN || '',
  },
  // DevFlo Gateway (Container dev agent)
  devFloGateway: {
    url: process.env.DEVFLO_GATEWAY_URL || 'ws://devflo-moltworker.srvcflo.workers.dev',
    httpUrl: process.env.DEVFLO_GATEWAY_HTTP_URL || 'https://devflo-moltworker.srvcflo.workers.dev',
    token: process.env.DEVFLO_GATEWAY_TOKEN || '',
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
  },
} as const;

export function validateConfig(): string[] {
  const missing: string[] = [];
  if (!config.cloudflare.apiToken) missing.push('CLOUDFLARE_API_TOKEN');
  if (!config.floGateway.token) missing.push('FLO_GATEWAY_TOKEN');
  if (!config.devFloGateway.token) missing.push('DEVFLO_GATEWAY_TOKEN');
  return missing;
}
