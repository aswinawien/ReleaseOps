'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SignOutButton } from '@/features/auth/sign-out-button';
import { ConnectionBadge, ConnectionBanner } from '@/features/realtime/connection-banner';
import { SkipLink } from '@/components/ui/skip-link';

const links = [
  { href: '/dashboard', label: 'Board' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/approvals', label: 'Approvals' },
  { href: '/team', label: 'Team' },
  { href: '/tickets/new', label: 'New ticket' },
  { href: '/notifications', label: 'Alerts' },
];

export function AppShell({
  organizationName,
  userName,
  role,
  unreadCount,
  pendingApprovalCount,
  children,
}: {
  organizationName: string;
  userName: string;
  role: string;
  unreadCount: number;
  pendingApprovalCount: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function isActive(href: string) {
    if (href === '/tickets') {
      return pathname === '/tickets' || (pathname.startsWith('/tickets/') && pathname !== '/tickets/new');
    }
    return pathname === href;
  }

  const nav = (
    <nav aria-label="Primary" className="flex flex-col gap-1 md:flex-row md:flex-wrap md:items-center">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'inline-flex min-h-11 items-center px-3 text-sm font-medium',
            isActive(link.href) ? 'bg-white/10 text-white' : 'text-rail-ink/80 hover:bg-white/5 hover:text-white',
          )}
          aria-current={isActive(link.href) ? 'page' : undefined}
        >
          {link.label}
          {link.href === '/notifications' && unreadCount > 0 ? (
            <span className="ml-2 bg-signal px-1.5 py-0.5 text-xs font-semibold text-ink tabular">
              {unreadCount}
            </span>
          ) : null}
          {link.href === '/approvals' && pendingApprovalCount > 0 ? (
            <span className="ml-2 bg-signal px-1.5 py-0.5 text-xs font-semibold text-ink tabular">
              {pendingApprovalCount}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper">
      <SkipLink />
      <header className="bg-rail text-rail-ink">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="font-display text-2xl leading-none">ReleaseOps</p>
            <p className="mt-1 truncate text-xs text-rail-ink/70">{organizationName}</p>
          </div>
          <div className="hidden flex-1 md:block">{nav}</div>
          <div className="ml-auto hidden items-center gap-4 md:flex">
            <ConnectionBadge />
            <p className="text-sm">
              {userName}
              <span className="ml-2 capitalize text-rail-ink/60">{role}</span>
            </p>
            <SignOutButton variant="rail" />
          </div>
          <button
            type="button"
            className="ml-auto min-h-11 border border-white/20 px-3 text-sm font-semibold md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
        </div>
        {open ? (
          <div id="mobile-nav" className="border-t border-white/10 px-4 py-3 md:hidden">
            {nav}
            <div className="mt-4 grid gap-2 border-t border-white/10 pt-3 text-sm">
              <ConnectionBadge />
              <p>
                {userName}
                <span className="ml-2 capitalize text-rail-ink/60">{role}</span>
              </p>
              <SignOutButton variant="rail" />
            </div>
          </div>
        ) : null}
      </header>
      <ConnectionBanner />
      <main
        id="main-content"
        className={cn(
          'mx-auto px-4 py-6 md:py-8',
          pathname === '/dashboard' ? 'max-w-none' : 'max-w-6xl',
        )}
      >
        {children}
      </main>
    </div>
  );
}
