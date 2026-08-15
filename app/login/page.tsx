import Link from 'next/link';
import { LoginForm } from '@/features/auth/login-form';
import { isSupabaseConfigured } from '@/lib/env';
import { Alert } from '@/components/ui/alert';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sea">ReleaseOps</p>
      <h1 className="mt-3 font-display text-4xl">Sign in</h1>
      <p className="mt-2 text-ink-soft">
        Work orders, comments, and live collaboration for a small studio team.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-card p-6 shadow-sm">
        {isSupabaseConfigured() ? (
          <LoginForm />
        ) : (
          <Alert>
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
          </Alert>
        )}
      </div>
      <p className="mt-4 text-sm text-ink-soft">
        New workspace?{' '}
        <Link href="/signup" className="font-semibold text-sea underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
