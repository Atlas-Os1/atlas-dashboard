import Link from 'next/link';
import { ArrowLeft, ListTodo } from 'lucide-react';
import { TaskBoard } from '@/components/task-board';

export default function TasksPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-[oklch(0.68_0.19_35)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[oklch(0.68_0.19_35)]/15 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-[oklch(0.68_0.19_35)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                Task Tracker
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Track project progress across all Atlas initiatives
              </p>
            </div>
          </div>
        </div>

        <TaskBoard />
      </div>
    </main>
  );
}
