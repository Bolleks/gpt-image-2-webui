'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Image,
  GalleryVertical,
  History,
  Settings,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Image, label: 'Генерация' },
  { href: '/gallery', icon: GalleryVertical, label: 'Галерея' },
  { href: '/history', icon: History, label: 'История' },
  { href: '/prompts', icon: BookMarked, label: 'Промпты' },
  { href: '/settings', icon: Settings, label: 'Настройки' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">GPT Image 2</h2>
            <p className="text-xs text-white/40">WebUI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/30 text-center">
          GPT Image 2 WebUI
        </p>
      </div>
    </div>
  );
}
