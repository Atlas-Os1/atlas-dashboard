/**
 * Type definitions for MCP server responses
 */

// Workers Observability
export interface WorkerLog {
  timestamp: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  scriptName: string;
}

export interface WorkerMetric {
  timestamp: string;
  requests: number;
  errors: number;
  cpuTime: number;
  duration: number;
}

export interface WorkerTrace {
  traceId: string;
  timestamp: string;
  duration: number;
  status: number;
  scriptName: string;
}

// Audit Logs
export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: {
    id: string;
    email: string;
    type: 'user' | 'service';
  };
  resource: {
    type: string;
    id: string;
  };
  metadata: Record<string, any>;
}

// DNS Analytics
export interface DNSQuery {
  timestamp: string;
  queryName: string;
  queryType: string;
  responseCode: string;
  origin: string;
}

export interface DNSAnalytics {
  total: number;
  cached: number;
  uncached: number;
  byType: Record<string, number>;
  byResponseCode: Record<string, number>;
}

// Workers Builds
export interface WorkerBuild {
  id: string;
  scriptName: string;
  status: 'queued' | 'building' | 'success' | 'failed';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  error?: string;
}

// Workers Bindings
export interface WorkerBinding {
  name: string;
  type: 'kv_namespace' | 'd1' | 'r2_bucket' | 'queue' | 'durable_object' | 'service' | 'analytics_engine';
  binding: Record<string, any>;
}

// DEX Analysis (Digital Experience Monitoring)
export interface DEXMetric {
  timestamp: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  metrics: {
    dns: number;
    tcp: number;
    tls: number;
    ttfb: number;
    download: number;
    total: number;
  };
}

// Radar
export interface RadarInsight {
  timestamp: string;
  metric: string;
  value: number;
  change: number;
  region?: string;
}

// CASB (Cloud Access Security Broker)
export interface CASBFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  resource: string;
  timestamp: string;
}

// Database Monitoring
export interface D1Database {
  uuid: string;
  name: string;
  version: string;
  size: number;
  numTables: number;
  fileSize: number;
}

export interface D1Query {
  query: string;
  duration: number;
  timestamp: string;
}

export interface R2Bucket {
  name: string;
  creation_date: string;
}

export interface R2Object {
  key: string;
  size: number;
  uploaded: string;
  etag: string;
}

export interface R2Stats {
  objectCount: number;
  totalSize: number;
  recentUploads: number;
  bandwidth: {
    egress: number;
    ingress: number;
  };
}

export interface KVNamespace {
  id: string;
  title: string;
  supports_url_encoding: boolean;
}

export interface KVStats {
  keyCount: number;
  storageSize: number;
  reads: number;
  writes: number;
}

// Aggregated Dashboard Data
export interface AggregatedMetrics {
  timestamp: number;
  
  // Workers
  workers: {
    totalRequests: number;
    totalErrors: number;
    avgCpuTime: number;
    activeWorkers: number;
  };
  
  // Database
  database: {
    d1: {
      databases: number;
      totalSize: number;
      recentQueries: number;
    };
    r2: {
      buckets: number;
      totalObjects: number;
      totalSize: number;
    };
    kv: {
      namespaces: number;
      totalKeys: number;
      totalSize: number;
    };
  };
  
  // Security
  security: {
    auditLogs: number;
    casbFindings: number;
    criticalFindings: number;
  };
  
  // Performance
  performance: {
    avgDNSTime: number;
    avgTTFB: number;
    globalUptime: number;
  };
}
