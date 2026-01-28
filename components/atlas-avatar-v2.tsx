'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SystemHealth } from '@/types';
import Image from 'next/image';
import { getHealthColor } from '@/lib/utils';
import { useState } from 'react';

interface AtlasAvatarProps {
  health: SystemHealth;
  isListening?: boolean;
}

const FLO_AVATAR_URL = 'https://pub-748cd0b5fd7d4d38a0c3ad5c09d205ae.r2.dev/skills/art_bucket/flo-animated.gif';

export function AtlasAvatarV2({ health, isListening = false }: AtlasAvatarProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const healthColor = getHealthColor(health.overall);
  
  // Animation parameters based on health
  const getAnimationParams = () => {
    switch (health.overall) {
      case 'healthy':
        return {
          pulseSpeed: 2.0,
          glowIntensity: 35,
          particleCount: 8,
          flowDistance: 12,
        };
      case 'warning':
        return {
          pulseSpeed: 3.5,
          glowIntensity: 25,
          particleCount: 4,
          flowDistance: 8,
        };
      case 'critical':
        return {
          pulseSpeed: 5.0,
          glowIntensity: 20,
          particleCount: 2,
          flowDistance: 6,
        };
      default:
        return {
          pulseSpeed: 4.0,
          glowIntensity: 15,
          particleCount: 0,
          flowDistance: 5,
        };
    }
  };

  const { pulseSpeed, glowIntensity, particleCount, flowDistance } = getAnimationParams();

  // Generate particle positions
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    angle: (360 / particleCount) * i,
    delay: (pulseSpeed / particleCount) * i,
  }));

  return (
    <div 
      className="relative flex flex-col items-center gap-6 p-8"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Main Avatar Container */}
      <motion.div
        className="relative w-56 h-56"
        animate={{
          scale: [1, 1.05, 1],
          y: [0, -flowDistance, 0],
        }}
        transition={{
          duration: pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Multi-layer Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{ backgroundColor: healthColor }}
          animate={{
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: pulseSpeed * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ backgroundColor: healthColor }}
          animate={{
            opacity: [0.25, 0.6, 0.25],
            scale: [1.1, 1.4, 1.1],
          }}
          transition={{
            duration: pulseSpeed * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />
        
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: healthColor }}
          animate={{
            opacity: [0.35, 0.75, 0.35],
            scale: [1.2, 1.5, 1.2],
          }}
          transition={{
            duration: pulseSpeed * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.4,
          }}
        />

        {/* Voice Listening Rings */}
        <AnimatePresence>
          {isListening && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: healthColor }}
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ scale: 1, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
        
        {/* Flo Avatar Image */}
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          animate={{
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: pulseSpeed * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div
            className="relative w-48 h-48"
            style={{
              filter: `drop-shadow(0 0 ${glowIntensity}px ${healthColor}) drop-shadow(0 0 ${glowIntensity * 0.5}px ${healthColor})`,
            }}
          >
            <Image
              src={FLO_AVATAR_URL}
              alt="Flo - Atlas Guardian"
              width={192}
              height={192}
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </motion.div>

        {/* Floating Particles (healthy state) */}
        {particles.map(({ id, angle, delay }) => (
          <motion.div
            key={`particle-${id}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: healthColor,
              left: '50%',
              top: '50%',
              marginLeft: '-4px',
              marginTop: '-4px',
            }}
            animate={{
              x: [
                0,
                Math.cos((angle * Math.PI) / 180) * 60,
                Math.cos((angle * Math.PI) / 180) * 80,
                0,
              ],
              y: [
                0,
                Math.sin((angle * Math.PI) / 180) * 60,
                Math.sin((angle * Math.PI) / 180) * 80,
                0,
              ],
              opacity: [0, 0.8, 1, 0],
              scale: [0.5, 1, 1.2, 0.5],
            }}
            transition={{
              duration: pulseSpeed * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay,
            }}
          />
        ))}

        {/* Critical State Glitch Effect */}
        {health.overall === 'critical' && (
          <motion.div
            className="absolute inset-0"
            animate={{
              x: [0, -2, 2, -2, 2, 0],
              opacity: [0, 0.3, 0, 0.3, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <div className="w-full h-full bg-red-500 mix-blend-color" />
          </motion.div>
        )}
      </motion.div>

      {/* Avatar Info */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold mb-1 bg-gradient-to-r from-[oklch(0.68_0.19_35)] to-[oklch(0.65_0.24_250)] bg-clip-text text-transparent">
          Flo
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 font-medium tracking-wide uppercase">
          Atlas Guardian
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-3">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: healthColor }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <p className="text-sm font-semibold" style={{ color: healthColor }}>
            {health.overall.toUpperCase()}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {health.activeProjects}
            </span>
            <span>projects</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-neutral-400" />
          <div className="flex items-center gap-1">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {(health.totalRequests / 1000).toFixed(1)}K
            </span>
            <span>requests</span>
          </div>
          {health.totalErrors > 0 && (
            <>
              <div className="w-1 h-1 rounded-full bg-neutral-400" />
              <div className="flex items-center gap-1 text-red-500">
                <span className="font-semibold">{health.totalErrors}</span>
                <span>errors</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Detailed Tooltip (on hover) */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-4 glass rounded-xl p-4 shadow-xl min-w-[280px] z-10"
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Avg CPU Time</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {health.avgCpuTime.toFixed(2)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Total Requests</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {health.totalRequests.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Error Rate</span>
                <span className="font-semibold" style={{ 
                  color: health.totalErrors > 0 ? getHealthColor('error') : getHealthColor('healthy') 
                }}>
                  {health.totalRequests > 0 
                    ? ((health.totalErrors / health.totalRequests) * 100).toFixed(2)
                    : '0.00'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Active Projects</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {health.activeProjects}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
