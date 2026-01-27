import { Suspense } from 'react';
import Image from 'next/image';
import { AtlasAvatar } from '@/components/atlas-avatar';
import { ProjectCard } from '@/components/project-card';
import { ActivityFeed } from '@/components/activity-feed';
import { WorkerAnalyticsChart } from '@/components/worker-analytics-chart';
import {
  fetchAllProjectsStatus,
  fetchWorkerAnalytics,
  calculateSystemHealth,
  fetchRecentActivity,
} from '@/lib/data-service';
import { RefreshButton } from '@/components/refresh-button';

async function DashboardContent() {
  const [projects, analytics, health, activity] = await Promise.all([
    fetchAllProjectsStatus(),
    fetchWorkerAnalytics(),
    calculateSystemHealth(),
    fetchRecentActivity(),
  ]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Atlas Live View
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitoring all Minte Cloudflare projects
          </p>
        </div>
        <RefreshButton />
      </div>

      {/* Atlas Avatar */}
      <div className="mb-8 flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <AtlasAvatar health={health} />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Analytics and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorkerAnalyticsChart analytics={analytics} />
        </div>
        <div>
          <ActivityFeed events={activity} />
        </div>
      </div>
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 relative">
          <Image
            src="https://pub-748cd0b5fd7d4d38a0c3ad5c09d205ae.r2.dev/skills/art_bucket/flo-animated.gif"
            alt="Flo"
            width={96}
            height={96}
            className="object-contain"
            unoptimized
          />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Flo is loading Atlas...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<LoadingState />}>
          <DashboardContent />
        </Suspense>
      </div>
    </main>
  );
}
