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
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/tickets/new', label: 'New ticket' },
  { href: '/notifications', label: 'Notifications' },
];

export function AppShell({
  organizationName,
  userName,
  role,
  unreadCount,
  children,
}: {
  organizationName: string;
  userName: string;
  role: string;
  unreadCount: number;
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

  return (
    <div className="min-h-screen bg-paper">
      <SkipLink />
      <ConnectionBanner />
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 w-72 border-r border-line bg-ink text-paper transition-transform md:static md:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          )}
        >
          <div className="flex h-full flex-col px-5 py-6">
            <p className="font-display text-2xl">ReleaseOps</p>
            <p className="mt-1 text-sm text-paper/70">{organizationName}</p>
            <nav aria-label="Primary" className="mt-8 grid gap-1">
              {links.map((link) => {
                const active =
                  link.href === '/tickets'
                    ? pathname === '/tickets' ||
                      (pathname.startsWith('/tickets/') && pathname !== '/tickets/new')
                    : pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium',
                      active ? 'bg-white/10 text-white' : 'text-paper/80 hover:bg-white/5',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.label}
                    {link.href === '/notifications' && unreadCount > 0 ? (
                      <span className="ml-2 rounded-full bg-signal px-2 py-0.5 text-xs text-ink">
                        {unreadCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto grid gap-2 text-sm">
              <ConnectionBadge />
              <p>
                {userName}
                <span className="block capitalize text-paper/60">{role}</span>
              </p>
              <SignOutButton />
            </div>
          </div>
        </aside>
        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-ink/40 md:hidden"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
            <p className="font-display text-lg">ReleaseOps</p>
            <button
              type="button"
              className="min-h-11 rounded-md border border-line bg-white px-3 text-sm font-semibold"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((value) => !value)}
            >
              Menu
            </button>
          </header>
          <main id="main-content" className="flex-1 px-4 py-6 md:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
