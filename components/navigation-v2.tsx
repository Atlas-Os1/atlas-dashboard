'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Activity,
  FileText,
  BarChart3,
  Search,
  Moon,
  Sun,
  Mic,
  MicOff,
  Database,
  Zap,
  Settings,
  ListTodo,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function NavigationV2() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isListening, setIsListening] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // TODO: Implement voice control
    console.log('Voice control:', !isListening);
  };

  const navItems = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/workers', label: 'Workers', icon: Server },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/logs', label: 'Logs', icon: FileText },
    { href: '/database', label: 'Database', icon: Database },
  ];

  return (
    <>
      {/* Main Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 glass border-b border-neutral-200 dark:border-neutral-800"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.68_0.19_35)] to-[oklch(0.65_0.24_250)] flex items-center justify-center shadow-lg"
              >
                <Activity className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-[oklch(0.68_0.19_35)] transition-colors">
                  Atlas
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-none">
                  Live View
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all',
                      isActive
                        ? 'text-[oklch(0.68_0.19_35)]'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-[oklch(0.68_0.19_35)] opacity-10 rounded-lg"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Search (Cmd+K)"
              >
                <Search className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </motion.button>

              {/* Voice Control Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleVoice}
                className={cn(
                  'p-2 rounded-lg transition-all relative',
                  isListening
                    ? 'bg-[oklch(0.68_0.19_35)] text-white shadow-lg'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                )}
                title="Voice Control"
              >
                {isListening ? (
                  <>
                    <Mic className="w-5 h-5" />
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-[oklch(0.68_0.19_35)]"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </>
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Toggle Theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5 text-neutral-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5 text-neutral-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Settings (future) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl w-full max-w-2xl p-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-700">
                <Search className="w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search projects, logs, metrics..."
                  className="flex-1 bg-transparent outline-none text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 rounded">
                  ESC
                </kbd>
              </div>
              <div className="p-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Start typing to search...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav (future) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-neutral-200 dark:border-neutral-800 z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-[oklch(0.68_0.19_35)]'
                    : 'text-neutral-600 dark:text-neutral-400'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
