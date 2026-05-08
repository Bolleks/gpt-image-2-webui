'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Image,
  GalleryVertical,
  History,
  Settings,
  BookMarked,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  LogOut,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Image, label: 'Генерация' },
  { href: '/gallery', icon: GalleryVertical, label: 'Галерея' },
  { href: '/history', icon: History, label: 'История' },
  { href: '/prompts', icon: BookMarked, label: 'Промпты' },
];

const bottomNavItems = [
  { href: '/settings', icon: Settings, label: 'Настройки' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userId, setUserId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }

    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.id) {
          setUserId(data.user.id);
        }
      })
      .catch(() => {});
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex fixed left-0 top-0 h-full flex-col z-30',
        'bg-white/[0.04] backdrop-blur-[20px]',
        'border-r border-white/[0.08]',
        'transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn(
        'p-4 border-b border-white/[0.08] flex items-center',
        isCollapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-sm font-bold text-white">GPT Image 2</h1>
            <p className="text-xs text-white/40">WebUI</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                isCollapsed && 'justify-center',
                isActive
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-white/[0.08] space-y-1">
        {userId && !isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-1.5">
            <span className="text-[10px] text-white/30 uppercase tracking-wider">ID</span>
            <span className="font-mono text-xs text-white/50 flex-1">{userId}</span>
            <button onClick={copyUserId} className="text-white/30 hover:text-white/60 transition-colors">
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}
        {userId && isCollapsed && (
          <button
            onClick={copyUserId}
            className="flex items-center justify-center px-3 py-2 text-white/30 hover:text-white/60 transition-colors"
            title={`ID: ${userId}`}
          >
            <Copy className="w-4 h-4" />
          </button>
        )}

        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                isCollapsed && 'justify-center',
                isActive
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl w-full',
            'text-white/50 hover:text-white/70 hover:bg-white/5 transition-all duration-200',
            isCollapsed && 'justify-center'
          )}
          title="Выйти"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Выйти</span>}
        </button>

        <button
          onClick={toggleCollapse}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl w-full',
            'text-white/50 hover:text-white/70 hover:bg-white/5 transition-all duration-200',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Развернуть' : 'Свернуть'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Свернуть</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}