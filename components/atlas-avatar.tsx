'use client';

import { motion } from 'framer-motion';
import { SystemHealth } from '@/types';
import Image from 'next/image';

interface AtlasAvatarProps {
  health: SystemHealth;
}

const FLO_AVATAR_URL = 'https://pub-748cd0b5fd7d4d38a0c3ad5c09d205ae.r2.dev/skills/art_bucket/flo-avatar-orange-black.png';

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
        return 30;
      case 'warning':
        return 20;
      case 'critical':
        return 15;
      default:
        return 10;
    }
  };

  const getFlowSpeed = () => {
    switch (health.overall) {
      case 'healthy':
        return 2.5; // Fast, smooth flow
      case 'warning':
        return 3.5; // Moderate flow
      case 'critical':
        return 5; // Slower, struggling flow
      default:
        return 4;
    }
  };

  const color = getColor();
  const glowIntensity = getGlowIntensity();
  const flowSpeed = getFlowSpeed();

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <motion.div
        className="relative w-48 h-48"
        animate={{
          scale: [1, 1.08, 1],
          y: [0, -8, 0],
        }}
        transition={{
          duration: flowSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Multi-layer glow effect for flowing appearance */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ backgroundColor: color }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: flowSpeed * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: color }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1.1, 1.3, 1.1],
          }}
          transition={{
            duration: flowSpeed * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />
        
        {/* Flo avatar with flowing animation */}
        <motion.div
          className="relative w-full h-full"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: flowSpeed * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              filter: `drop-shadow(0 0 ${glowIntensity}px ${color}) drop-shadow(0 0 ${glowIntensity * 0.5}px ${color})`,
            }}
          >
            <Image
              src={FLO_AVATAR_URL}
              alt="Flo - Atlas Avatar"
              width={192}
              height={192}
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Flowing particles effect */}
        {health.overall === 'healthy' && (
          <>
            <motion.div
              className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                y: [-20, 20],
                x: [-10, 10],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{
                y: [20, -20],
                x: [10, -10],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
          </>
        )}
      </motion.div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-orange-500 to-black bg-clip-text text-transparent">
          Flo
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Atlas Guardian
        </p>
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
