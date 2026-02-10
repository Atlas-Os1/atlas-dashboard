'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Loader2, MessageCircle } from 'lucide-react';
import { ChatMessage } from './chat-message';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface AgentChatProps {
  agentId?: string;
  agentName?: string;
  sessionKey?: string;
  className?: string;
}

export function AgentChat({
  agentId = 'main',
  agentName = 'DevFlo',
  sessionKey,
  className,
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(
    sessionKey || null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load session history if sessionKey provided
  useEffect(() => {
    if (activeSession) {
      fetch(`/api/chat/${encodeURIComponent(activeSession)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMessages(
              data.map((m: Record<string, unknown>) => ({
                role: m.role as Message['role'],
                content: m.content as string,
                timestamp: (m.timestamp as string) || new Date().toISOString(),
              }))
            );
          }
        })
        .catch(console.error);
    }
  }, [activeSession]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey: activeSession,
          agentId,
          message: userMessage.content,
        }),
      });

      const data = await res.json();

      if (data.sessionKey && !activeSession) {
        setActiveSession(data.sessionKey);
      }

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant' as const,
            content: data.response,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Send failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'system' as const,
          content: 'Failed to send message. Check gateway connection.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`flex flex-col glass rounded-2xl overflow-hidden ${className || 'h-[600px]'}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200/10">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {agentName}
          </h3>
          <p className="text-xs text-neutral-500">
            {activeSession
              ? `Session: ${activeSession.slice(0, 12)}...`
              : 'New conversation'}
          </p>
        </div>
        <div
          className={`ml-auto w-2 h-2 rounded-full ${sending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400">
            <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Start a conversation with {agentName}</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
              agentName={msg.role === 'assistant' ? agentName : undefined}
            />
          ))}
        </AnimatePresence>
        {sending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-neutral-400"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">{agentName} is thinking...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-200/10">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agentName}...`}
            rows={1}
            className="flex-1 resize-none bg-neutral-100/50 dark:bg-neutral-800/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
