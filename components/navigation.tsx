'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, FileText } from 'lucide-react';
import Image from 'next/image';

const FLO_AVATAR_URL = 'https://pub-748cd0b5fd7d4d38a0c3ad5c09d205ae.r2.dev/skills/art_bucket/flo-animated.gif';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/logs', label: 'Logs', icon: FileText },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 relative">
              <Image
                src={FLO_AVATAR_URL}
                alt="Flo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-black bg-clip-text text-transparent">
                Atlas
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                by Flo
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || 
                (link.href !== '/' && pathname?.startsWith(link.href));
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
