import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getProjectById } from '@/lib/projects';
import { cloudflare } from '@/lib/cloudflare';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function ProjectDetails({ id }: { id: string }) {
  const project = getProjectById(id);
  
  if (!project) {
    notFound();
  }

  const analytics = project.workerId 
    ? await cloudflare.getWorkerAnalytics(project.workerId)
    : null;

  const errorRate = analytics && analytics.requests > 0
    ? ((analytics.errors / analytics.requests) * 100).toFixed(2)
    : '0';

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {project.name}
        </h1>
        
        <a
          href={`https://${project.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          {project.domain}
          <ExternalLink className="w-4 h-4" />
        </a>

        {analytics ? (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Analytics (Last 24 Hours)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.requests.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Errors</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {analytics.errors.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {errorRate}% error rate
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">CPU Time</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.cpu_time.toFixed(2)}ms
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subrequests</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {analytics.subrequests.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Time Range
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(analytics.since).toLocaleString()} -{' '}
                {new Date(analytics.until).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No analytics data available for this project
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectDetails id={id} />
      </Suspense>
    </main>
  );
}
