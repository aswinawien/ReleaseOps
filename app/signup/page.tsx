import Link from 'next/link';
import { SignupForm } from '@/features/auth/signup-form';
import { isSupabaseConfigured } from '@/lib/env';
import { Alert } from '@/components/ui/alert';

export const metadata = { title: 'Create workspace' };

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sea">ReleaseOps</p>
      <h1 className="mt-3 font-display text-4xl">Create a workspace</h1>
      <p className="mt-2 text-ink-soft">
        Sign up as an owner. You can invite agents and clients after the database is seeded.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-card p-6 shadow-sm">
        {isSupabaseConfigured() ? (
          <SignupForm />
        ) : (
          <Alert>
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
          </Alert>
        )}
      </div>
      <p className="mt-4 text-sm text-ink-soft">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-sea underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
