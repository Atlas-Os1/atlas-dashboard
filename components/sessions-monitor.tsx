'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Bot,
  Webhook,
  GitBranch,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Loader2,
  Circle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react';

interface SessionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface Session {
  sessionKey: string;
  kind: string;
  channel: string;
  agentId: string;
  label?: string;
  lastActivity?: string;
  messages?: SessionMessage[];
}

type SessionKind = 'main' | 'sub-agent' | 'webhook' | 'unknown';

function classifySession(session: Session): SessionKind {
  const key = session.sessionKey?.toLowerCase() || '';
  const kind = session.kind?.toLowerCase() || '';
  if (kind.includes('webhook') || key.includes('webhook')) return 'webhook';
  if (kind.includes('subagent') || key.includes('subagent') || kind.includes('sub-agent') || key.includes('sub-agent')) return 'sub-agent';
  if (kind.includes('main') || key.includes('main')) return 'main';
  return 'unknown';
}

const kindConfig: Record<SessionKind, { icon: typeof Bot; color: string; bg: string; label: string }> = {
  main: {
    icon: Bot,
    color: 'text-[oklch(0.68_0.19_35)]',
    bg: 'bg-[oklch(0.68_0.19_35)]/15',
    label: 'Main Agent',
  },
  'sub-agent': {
    icon: GitBranch,
    color: 'text-[oklch(0.65_0.24_250)]',
    bg: 'bg-[oklch(0.65_0.24_250)]/15',
    label: 'Sub-Agent',
  },
  webhook: {
    icon: Webhook,
    color: 'text-[oklch(0.72_0.19_149)]',
    bg: 'bg-[oklch(0.72_0.19_149)]/15',
    label: 'Webhook',
  },
  unknown: {
    icon: Activity,
    color: 'text-neutral-400',
    bg: 'bg-neutral-400/15',
    label: 'Session',
  },
};

const statusConfig: Record<string, { icon: typeof Circle; color: string }> = {
  active: { icon: Circle, color: 'text-[oklch(0.72_0.19_149)]' },
  completed: { icon: CheckCircle2, color: 'text-neutral-400' },
  error: { icon: AlertTriangle, color: 'text-[oklch(0.55_0.22_25)]' },
};

function timeAgo(dateStr?: string): string {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface SessionsMonitorProps {
  className?: string;
  compact?: boolean;
}

export function SessionsMonitor({ className, compact = false }: SessionsMonitorProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<SessionMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/sessions');
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
      setLastRefresh(new Date());
    } catch (err) {
      // If gateway is unavailable, show empty state instead of error
      if (sessions.length === 0) {
        setSessions([]);
      }
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const toggleExpand = async (sessionKey: string) => {
    if (expandedId === sessionKey) {
      setExpandedId(null);
      setExpandedMessages([]);
      return;
    }

    setExpandedId(sessionKey);
    setLoadingMessages(true);

    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(sessionKey)}?limit=10`);
      if (res.ok) {
        const data = await res.json();
        setExpandedMessages(Array.isArray(data) ? data : []);
      } else {
        setExpandedMessages([]);
      }
    } catch {
      setExpandedMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-48 ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.68_0.19_35)]" />
      </div>
    );
  }

  const displaySessions = compact ? sessions.slice(0, 5) : sessions;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[oklch(0.68_0.19_35)]" />
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            Active Sessions
          </span>
          <span className="text-xs text-neutral-400 bg-neutral-200/30 dark:bg-neutral-700/30 px-2 py-0.5 rounded-full">
            {sessions.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-400">
            {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchSessions}
            className="p-1.5 rounded-lg hover:bg-neutral-200/40 dark:hover:bg-neutral-700/40 transition-colors text-neutral-400"
            title="Refresh sessions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-3 p-2 rounded-lg bg-amber-100/30 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Gateway unavailable — showing cached data</span>
        </div>
      )}

      {/* Sessions list */}
      {displaySessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-neutral-400">
          <Activity className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">No active sessions</p>
          <p className="text-[10px] mt-1">Sessions appear when agents are running</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {displaySessions.map((session) => {
              const kind = classifySession(session);
              const kindCfg = kindConfig[kind];
              const KindIcon = kindCfg.icon;
              const isExpanded = expandedId === session.sessionKey;
              const statusCfg = statusConfig['active']; // default
              const StatusIcon = statusCfg.icon;

              return (
                <motion.div
                  key={session.sessionKey}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass rounded-xl overflow-hidden"
                >
                  {/* Session row */}
                  <button
                    onClick={() => toggleExpand(session.sessionKey)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-neutral-200/20 dark:hover:bg-neutral-700/20 transition-colors text-left"
                  >
                    {/* Kind indicator */}
                    <div className={`w-8 h-8 rounded-lg ${kindCfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <KindIcon className={`w-4 h-4 ${kindCfg.color}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50 truncate">
                          {session.label || session.agentId || session.sessionKey.slice(0, 16)}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${kindCfg.bg} ${kindCfg.color}`}>
                          {kindCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-neutral-400 truncate">
                          {session.channel || 'direct'} · {session.sessionKey.slice(0, 20)}...
                        </span>
                      </div>
                    </div>

                    {/* Status & time */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusIcon className={`w-2.5 h-2.5 ${statusCfg.color} fill-current`} />
                      <span className="text-[10px] text-neutral-400">
                        {timeAgo(session.lastActivity)}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded messages */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-neutral-200/20 dark:border-neutral-700/30"
                      >
                        <div className="p-3 max-h-64 overflow-y-auto space-y-2">
                          {loadingMessages ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                            </div>
                          ) : expandedMessages.length === 0 ? (
                            <p className="text-xs text-neutral-400 text-center py-4">
                              No messages available
                            </p>
                          ) : (
                            expandedMessages.map((msg, i) => (
                              <div key={i} className="flex gap-2">
                                <MessageSquare
                                  className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                                    msg.role === 'assistant'
                                      ? 'text-[oklch(0.68_0.19_35)]'
                                      : msg.role === 'user'
                                      ? 'text-[oklch(0.65_0.24_250)]'
                                      : 'text-neutral-400'
                                  }`}
                                />
                                <div className="min-w-0">
                                  <span className="text-[10px] font-medium text-neutral-500">
                                    {msg.role}
                                  </span>
                                  <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-3">
                                    {msg.content}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-neutral-400">
        <Clock className="w-3 h-3" />
        Auto-refreshes every 10s
      </div>
    </div>
  );
}
