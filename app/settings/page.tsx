import { Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  FolderGit2,
  Users,
  Cloud,
  Plus,
  Trash2,
  Edit,
  Save,
  Key,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface TrackedProject {
  id: string;
  name: string;
  repository: string;
  branch: string;
  environment: 'production' | 'staging' | 'development';
  enabled: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  avatar?: string;
  status: 'active' | 'inactive';
}

interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  connected: boolean;
  lastSync?: string;
}

// Mock data - In production, fetch from database
async function fetchSettings() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const projects: TrackedProject[] = [
    {
      id: '1',
      name: 'kiamichi-biz-connect',
      repository: 'github.com/Atlas-Os1/kiamichi-biz-connect',
      branch: 'main',
      environment: 'production',
      enabled: true,
    },
    {
      id: '2',
      name: 'twisted',
      repository: 'github.com/Atlas-Os1/twisted',
      branch: 'main',
      environment: 'production',
      enabled: true,
    },
    {
      id: '3',
      name: 'srvcflo',
      repository: 'github.com/Atlas-Os1/srvcflo',
      branch: 'main',
      environment: 'production',
      enabled: true,
    },
    {
      id: '4',
      name: 'atlas-dashboard',
      repository: 'github.com/Atlas-Os1/atlas-dashboard',
      branch: 'main',
      environment: 'production',
      enabled: true,
    },
    {
      id: '5',
      name: 'devflo-moltworker',
      repository: 'github.com/devflo/moltworker',
      branch: 'main',
      environment: 'production',
      enabled: true,
    },
  ];

  const team: TeamMember[] = [
    {
      id: '1',
      name: 'Flo (DevFlo)',
      email: 'flo@minte.dev',
      role: 'admin',
      status: 'active',
    },
    {
      id: '2',
      name: 'Atlas AI',
      email: 'atlas@minte.dev',
      role: 'developer',
      status: 'active',
    },
    {
      id: '3',
      name: 'CI/CD Bot',
      email: 'bot@minte.dev',
      role: 'developer',
      status: 'active',
    },
  ];

  const cloudflare: CloudflareConfig = {
    accountId: 'ff3c5e2beaea9f85fee3200bfe28da16',
    apiToken: '••••••••••••••••',
    connected: true,
    lastSync: '2026-01-31T15:30:00Z',
  };

  return { projects, team, cloudflare };
}

function ProjectsSettings({ projects }: { projects: TrackedProject[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderGit2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tracked Projects</h2>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={project.enabled}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{project.repository}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {project.branch}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${
                  project.environment === 'production'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : project.environment === 'staging'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}
              >
                {project.environment}
              </span>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors">
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Note:</strong> Projects are automatically synced with GitHub webhooks. Ensure your repository has
          the Atlas webhook configured for real-time updates.
        </p>
      </div>
    </div>
  );
}

function TeamSettings({ team }: { team: TeamMember[] }) {
  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    developer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="space-y-3">
        {team.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {member.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                defaultValue={member.role}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
                <option value="viewer">Viewer</option>
              </select>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  member.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {member.status === 'active' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {member.status}
              </span>
              <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors">
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Admin</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">Full access to all settings and data</p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Developer</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">Can manage projects and view analytics</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Viewer</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">Read-only access to dashboards</p>
        </div>
      </div>
    </div>
  );
}

function CloudflareSettings({ cloudflare }: { cloudflare: CloudflareConfig }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Cloud className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cloudflare Integration</h2>
      </div>

      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-300">Connected to Cloudflare</p>
              <p className="text-sm text-green-700 dark:text-green-400">
                Last synced: {new Date(cloudflare.lastSync || '').toLocaleString()}
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors">
            Sync Now
          </button>
        </div>

        {/* Account ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Account ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cloudflare.accountId}
              readOnly
              className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
            />
            <button className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Token */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            API Token
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={cloudflare.apiToken}
                readOnly
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
            <button className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Update Token
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Token requires <strong>Workers:Read</strong>, <strong>Analytics:Read</strong>, and{' '}
            <strong>Logs:Read</strong> permissions
          </p>
        </div>

        {/* Sync Settings */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Sync Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-sync worker metrics every 5 minutes
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Enable real-time log streaming via Tail Workers
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Send Slack notifications for deployment events
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

async function SettingsContent() {
  const { projects, team, cloudflare } = await fetchSettings();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configure projects, team members, and integrations
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <ProjectsSettings projects={projects} />
        <TeamSettings team={team} />
        <CloudflareSettings cloudflare={cloudflare} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <SettingsIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
            </div>
          </div>
        }
      >
        <SettingsContent />
      </Suspense>
    </main>
  );
}
