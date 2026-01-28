/**
 * Base MCP Client for Cloudflare MCP Servers
 * 
 * This provides a unified interface for interacting with all Cloudflare MCP servers.
 * Each MCP server client extends this base class.
 */

export interface MCPRequest {
  method: string;
  params?: Record<string, any>;
}

export interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp: number;
}

export interface MCPClientConfig {
  accountId: string;
  apiToken: string;
  cacheEnabled?: boolean;
  cacheTTL?: number; // seconds
}

/**
 * Simple in-memory cache for MCP responses
 */
class MCPCache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  set(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl * 1000,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export abstract class BaseMCPClient {
  protected config: MCPClientConfig;
  protected cache: MCPCache;
  protected baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(config: MCPClientConfig) {
    this.config = {
      cacheEnabled: true,
      cacheTTL: 60, // default 60 seconds
      ...config,
    };
    this.cache = new MCPCache();
  }

  /**
   * Make a request to Cloudflare API
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MCPResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Check cache first
    if (this.config.cacheEnabled && options.method === 'GET') {
      const cached = this.cache.get(url);
      if (cached) {
        return {
          success: true,
          data: cached,
          cached: true,
          timestamp: Date.now(),
        };
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Cache successful GET requests
      if (this.config.cacheEnabled && options.method === 'GET' && result.success) {
        this.cache.set(url, result.result, this.config.cacheTTL!);
      }

      return {
        success: result.success,
        data: result.result,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`MCP request error: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Clear cache for this client
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get account ID from config
   */
  protected get accountId(): string {
    return this.config.accountId;
  }
}

/**
 * Create MCP client configuration from environment
 */
export function createMCPConfig(): MCPClientConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error('Missing Cloudflare credentials in environment');
  }

  return {
    accountId,
    apiToken,
    cacheEnabled: true,
    cacheTTL: 60,
  };
}
