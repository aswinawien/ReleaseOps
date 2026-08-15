import Link from 'next/link';
import { LoginForm } from '@/features/auth/login-form';
import { isSupabaseConfigured } from '@/lib/env';
import { Alert } from '@/components/ui/alert';
import { safeNextPath } from '@/lib/utils';

export const metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ? safeNextPath(params.next) : undefined;
  const signupHref =
    next && next.startsWith('/invite/')
      ? `/signup?next=${encodeURIComponent(next)}`
      : '/signup';

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
      <aside className="bg-rail px-8 py-12 text-rail-ink">
        <p className="font-display text-4xl leading-none">ReleaseOps</p>
        <p className="mt-4 max-w-[36ch] text-sm text-rail-ink/80">
          Work orders for a small studio desk. The database is the record; the live lamp only
          announces.
        </p>
      </aside>
      <main className="flex items-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[2.25rem] leading-none tracking-tight">Sign in</h1>
          <p className="mt-3 max-w-[65ch] text-sm text-ink-soft">
            Open the board for Harbor & Pine Studio, or the workspace you created.
          </p>
          <div className="mt-8 border border-line bg-board p-6">
            {isSupabaseConfigured() ? (
              <LoginForm next={next} />
            ) : (
              <Alert>
                Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
              </Alert>
            )}
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            After seeding, sign in as{' '}
            <code className="bg-white px-1">mira.owner@harborpine.test</code> with{' '}
            <code className="bg-white px-1">HarborPine!demo1</code>. Visiting{' '}
            <code className="bg-white px-1">/dashboard</code> without a session always returns here.
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            New workspace?{' '}
            <Link href={signupHref} className="font-semibold text-sea underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
