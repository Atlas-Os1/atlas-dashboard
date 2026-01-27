'use client';

import { motion } from 'framer-motion';
import { SystemHealth } from '@/types';

interface AtlasAvatarProps {
  health: SystemHealth;
}

export function AtlasAvatar({ health }: AtlasAvatarProps) {
  const getColor = () => {
    switch (health.overall) {
      case 'healthy':
        return '#10b981'; // green
      case 'warning':
        return '#f59e0b'; // amber
      case 'critical':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getGlowIntensity = () => {
    switch (health.overall) {
      case 'healthy':
        return 20;
      case 'warning':
        return 15;
      case 'critical':
        return 10;
      default:
        return 5;
    }
  };

  const color = getColor();
  const glowIntensity = getGlowIntensity();

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{ backgroundColor: color }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Tree emoji */}
        <div
          className="relative text-8xl filter drop-shadow-lg"
          style={{
            filter: `drop-shadow(0 0 ${glowIntensity}px ${color})`,
          }}
        >
          🌳
        </div>
      </motion.div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Atlas</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          System Status: <span style={{ color }} className="font-semibold capitalize">
            {health.overall}
          </span>
        </p>
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <div>{health.activeProjects} active projects</div>
          <div>{health.totalRequests.toLocaleString()} requests tracked</div>
          {health.totalErrors > 0 && (
            <div className="text-red-500">{health.totalErrors} errors</div>
          )}
        </div>
      </div>
    </div>
  );
}
