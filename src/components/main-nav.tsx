'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Timer, BrainCircuit, CheckSquare, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/app/timer', label: 'Study Timer', icon: Timer },
  { href: '/app/plan', label: 'AI Study Plan', icon: BrainCircuit },
  { href: '/app/achievements', label: 'Achievements', icon: Trophy },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive && 'bg-muted text-primary'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
