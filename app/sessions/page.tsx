import Link from 'next/link';
import { ArrowLeft, Activity } from 'lucide-react';
import { SessionsMonitor } from '@/components/sessions-monitor';

export default function SessionsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-[oklch(0.68_0.19_35)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[oklch(0.65_0.24_250)]/15 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[oklch(0.65_0.24_250)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                Session Monitor
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Track active agent sessions, sub-agents, and webhook handlers
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <SessionsMonitor />
        </div>
      </div>
    </main>
  );
}
