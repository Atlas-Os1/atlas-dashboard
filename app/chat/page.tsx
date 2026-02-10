import { Suspense } from 'react';
import { AgentChat } from '@/components/agent-chat';
import { ArrowLeft, Bot } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="glass p-2 rounded-xl hover:bg-neutral-200/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Agent Chat
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChatSkeleton name="DevFlo" />}>
          <AgentChat
            agentId="main"
            agentName="DevFlo"
            className="h-[calc(100vh-200px)]"
          />
        </Suspense>
        <Suspense fallback={<ChatSkeleton name="Flo" />}>
          <AgentChat
            agentId="flo"
            agentName="Flo"
            className="h-[calc(100vh-200px)]"
          />
        </Suspense>
      </div>
    </div>
  );
}

function ChatSkeleton({ name }: { name: string }) {
  return (
    <div className="glass rounded-2xl h-[calc(100vh-200px)] flex items-center justify-center">
      <p className="text-neutral-400 text-sm">Loading {name}...</p>
    </div>
  );
}
