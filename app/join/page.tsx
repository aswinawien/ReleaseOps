import { redirect } from 'next/navigation';
import { SignOutButton } from '@/features/auth/sign-out-button';
import { getAppContext } from '@/lib/auth/session';

export const metadata = { title: 'Join a workspace' };

export default async function JoinPage() {
  const context = await getAppContext();
  if (context) {
    redirect('/dashboard');
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
      <aside className="bg-rail px-8 py-12 text-rail-ink">
        <p className="font-display text-4xl leading-none">ReleaseOps</p>
        <p className="mt-4 max-w-[36ch] text-sm text-rail-ink/80">
          This account is signed in, but it is not on a workspace yet.
        </p>
      </aside>
      <main className="flex items-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[2.25rem] leading-none tracking-tight">No workspace yet</h1>
          <p className="mt-3 max-w-[65ch] text-sm text-ink-soft">
            Open the invite link an owner or admin sent you. Sign in with that same email, then join.
            Creating another workspace from here would fight the invite flow.
          </p>
          <div className="mt-8 grid gap-4 border border-line bg-board p-6">
            <p className="text-sm">
              Invite URLs look like <code className="bg-white px-1">/invite/…</code>. Sign out if
              you need a different email.
            </p>
            <SignOutButton variant="ghost" />
          </div>
        </div>
      </main>
    </div>
  );
}
