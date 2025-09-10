'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Timer, BrainCircuit, CheckSquare, Trophy, MessageSquare, Target, Users, Megaphone, Mail, Link as LinkIcon, Calculator, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { ADMIN_EMAIL } from '@/lib/constants';

const mainNavItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/app/goals', label: 'Goals', icon: Target },
  { href: '/app/timer', label: 'Study Timer', icon: Timer },
];

const aiNavItems = [
  { href: '/app/plan', label: 'AI Study Plan', icon: BrainCircuit },
  { href: '/app/tutor', label: 'AI Tutor', icon: MessageSquare },
];

const communityNavItems = [
  { href: '/app/achievements', label: 'Achievements', icon: Trophy },
  { href: '/app/community', label: 'Community', icon: Users },
];

const moreNavItems = [
    { href: '/app/mdcat-calculator', label: 'MDCAT Calculator', icon: Calculator },
    { href: '/app/resources', label: 'Resources', icon: LinkIcon },
    { href: '/app/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/app/contact', label: 'Contact & Feedback', icon: Mail },
];

const adminNavItems = [
    { href: '/app/admin', label: 'Admin Panel', icon: Shield },
];

export default function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const renderNavSection = (items: typeof mainNavItems, title?: string) => (
    <div className="grid items-start gap-1">
      {title && <h2 className="px-3 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</h2>}
      {items.map((item) => {
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
    </div>
  );

  return (
    <nav className="flex flex-col gap-4 px-2 text-sm font-medium lg:px-4 py-4">
      {renderNavSection(mainNavItems)}
      <Separator />
      {renderNavSection(aiNavItems, "AI Tools")}
      <Separator />
      {renderNavSection(communityNavItems, "Community")}
      <Separator />
      {renderNavSection(moreNavItems, "More")}
      {user && user.email === ADMIN_EMAIL && (
        <>
          <Separator />
          {renderNavSection(adminNavItems, "Admin")}
        </>
      )}
    </nav>
  );
}
