'use client';

import { useState, useEffect } from 'react';

interface LogEvent {
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: string;
  scriptName: string;
  metadata?: Record<string, any>;
}

interface LogStreamProps {
  scriptName: string;
}

export function LogStream({ scriptName }: LogStreamProps) {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/logs/stream?script=${encodeURIComponent(scriptName)}`
    );

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const log: LogEvent = JSON.parse(event.data);
        setLogs((prev) => [log, ...prev].slice(0, 100)); // Keep last 100 logs
      } catch (error) {
        console.error('Failed to parse log event:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [scriptName]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'warn':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'debug':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-800/50 text-slate-300 border-slate-700/50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className="text-slate-400">
          {isConnected ? 'Live' : 'Disconnected'}
        </span>
      </div>

      {/* Logs Display */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {logs.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            {isConnected ? 'Waiting for logs...' : 'Not connected'}
          </div>
        )}
        
        {logs.map((log, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border font-mono text-sm ${getLevelColor(log.level)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-slate-500 text-xs shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="font-semibold uppercase text-xs shrink-0">
                {log.level}
              </span>
              <span className="flex-1 break-words">{log.message}</span>
            </div>
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="mt-2 pl-16 text-xs opacity-70">
                {JSON.stringify(log.metadata, null, 2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
