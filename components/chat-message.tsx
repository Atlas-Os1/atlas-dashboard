'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  agentName?: string;
}

export function ChatMessage({ role, content, timestamp, agentName }: ChatMessageProps) {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="glass rounded-xl px-4 py-2 border border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400">{content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-accent/20 text-accent'
            : 'bg-primary/20 text-primary'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        {!isUser && agentName && (
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">
            {agentName}
          </span>
        )}
        <div
          className={`glass rounded-2xl px-4 py-3 ${
            isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
          }`}
        >
          <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
            {content}
          </p>
        </div>
        {timestamp && (
          <span className="text-[10px] text-neutral-400 mt-1 block">
            {format(new Date(timestamp), 'HH:mm')}
          </span>
        )}
      </div>
    </motion.div>
  );
}
