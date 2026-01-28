import { Suspense } from 'react';
import Image from 'next/image';
import { AtlasAvatarV2 } from '@/components/atlas-avatar-v2';
import { ProjectCardV2 } from '@/components/project-card-v2';
import { ActivityFeed } from '@/components/activity-feed';
import { WorkerAnalyticsChart } from '@/components/worker-analytics-chart';
import {
  fetchAllProjectsStatus,
  fetchWorkerAnalytics,
  calculateSystemHealth,
  fetchRecentActivity,
} from '@/lib/data-service';
import { RefreshButton } from '@/components/refresh-button';
import { Zap, TrendingUp, AlertCircle } from 'lucide-react';

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
