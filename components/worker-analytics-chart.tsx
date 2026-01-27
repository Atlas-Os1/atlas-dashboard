'use client';

import { WorkerAnalytics } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WorkerAnalyticsChartProps {
  analytics: WorkerAnalytics[];
}

export function WorkerAnalyticsChart({ analytics }: WorkerAnalyticsChartProps) {
  const data = analytics.map(a => ({
    name: a.workerName.substring(0, 20),
    requests: a.requests,
    errors: a.errors,
    cpuTime: a.cpuTime,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Worker Analytics
      </h3>
      
      {data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No analytics data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Legend />
            <Bar dataKey="requests" fill="#3b82f6" name="Requests" />
            <Bar dataKey="errors" fill="#ef4444" name="Errors" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
