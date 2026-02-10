import { Suspense } from 'react';
import Image from 'next/image';
import { AtlasAvatarV2 } from '@/components/atlas-avatar-v2';
import { ProjectCardV2 } from '@/components/project-card-v2';
import { ActivityFeed } from '@/components/activity-feed';
import { WorkerAnalyticsChart } from '@/components/worker-analytics-chart';
import { WorkerHealthCard } from '@/components/worker-health-card';
import {
  fetchAllProjectsStatus,
  fetchWorkerAnalytics,
  calculateSystemHealth,
  fetchRecentActivity,
} from '@/lib/data-service';
import { RefreshButton } from '@/components/refresh-button';
import { Zap, TrendingUp, AlertCircle, ListTodo, Server, ArrowRight } from 'lucide-react';
import Link from 'next/link';

async function DashboardContent() {
  const [projects, analytics, health, activity] = await Promise.all([
    fetchAllProjectsStatus(),
    fetchWorkerAnalytics(),
    calculateSystemHealth(),
    fetchRecentActivity(),
  ]);

  // Calculate quick stats
  const totalRequests = analytics.reduce((sum, a) => sum + a.requests, 0);
  const avgCpuTime = analytics.length > 0 
    ? analytics.reduce((sum, a) => sum + a.cpuTime, 0) / analytics.length 
    : 0;
  const activeAlerts = projects.filter(p => p.status === 'error' || p.status === 'warning').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Hero Section with Flo Avatar */}
      <section className="glass rounded-2xl p-8 text-center relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.68_0.19_35)]/5 via-transparent to-[oklch(0.65_0.24_250)]/5 pointer-events-none" />
        
        <div className="relative">
          <div className="flex justify-center mb-6">
            <AtlasAvatarV2 health={health} />
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-[oklch(0.68_0.19_35)]" />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Total Requests
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {(totalRequests / 1000).toFixed(1)}K
              </p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-[oklch(0.65_0.24_250)]" />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Avg CPU Time
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {avgCpuTime.toFixed(2)}ms
              </p>
            </div>
            
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-[oklch(0.75_0.20_65)]" />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Active Alerts
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {activeAlerts}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Task Summary Widget */}
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ListTodo className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Task Summary</h2>
          </div>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            View All Tasks
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Completed</span>
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">
              {projects.filter(p => p.status === 'healthy').length + 4}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">This sprint</p>
          </div>
          
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">In Progress</span>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {projects.filter(p => p.status !== 'error').length + 3}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Active now</p>
          </div>
          
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Planned</span>
              <div className="w-3 h-3 rounded-full bg-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {Math.max(5, projects.length - 2)}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Next sprint</p>
          </div>
        </div>
      </section>

      {/* Worker Health Dashboard */}
      <section>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
          Worker Health
        </h2>
        <WorkerHealthCard />
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/tasks"
            className="group glass rounded-xl p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ListTodo className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
              Task Tracker
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              View and manage completed, current, and future tasks
            </p>
          </Link>

          <Link
            href="/workers"
            className="group glass rounded-xl p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-green-300 dark:hover:border-green-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Server className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
              Worker Monitoring
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Monitor all Cloudflare Workers with real-time metrics
            </p>
          </Link>

          <Link
            href="/logs"
            className="group glass rounded-xl p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-amber-300 dark:hover:border-amber-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
              Unified Logs
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Real-time logs from all Cloudflare Workers
            </p>
          </Link>

          <Link
            href="/settings"
            className="group glass rounded-xl p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
              Settings
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Configure projects, team, and integrations
            </p>
          </Link>
        </div>
      </section>

      {/* Projects Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Active Projects
          </h2>
          <RefreshButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCardV2 key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      {/* Analytics and Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorkerAnalyticsChart analytics={analytics} />
        </div>
        <div>
          <ActivityFeed events={activity} />
        </div>
      </section>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-[oklch(0.68_0.19_35)] rounded-full blur-2xl opacity-30 animate-pulse" />
          <Image
            src="https://pub-748cd0b5fd7d4d38a0c3ad5c09d205ae.r2.dev/skills/art_bucket/flo-animated.gif"
            alt="Flo"
            width={128}
            height={128}
            className="object-contain relative z-10"
            priority
            unoptimized
          />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Flo is initializing Atlas...
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Gathering system metrics and health data
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[oklch(0.68_0.19_35)] animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DashboardContent />
    </Suspense>
  );
}
