import Link from 'next/link';
import { SignupForm } from '@/features/auth/signup-form';
import { isSupabaseConfigured } from '@/lib/env';
import { Alert } from '@/components/ui/alert';
import { invitationTokenSchema } from '@/lib/validations/memberships';
import { safeNextPath } from '@/lib/utils';

export const metadata = { title: 'Create workspace' };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; email?: string; next?: string }>;
}) {
  const params = await searchParams;
  const inviteParsed = invitationTokenSchema.safeParse(params.invite);
  const inviteToken = inviteParsed.success ? inviteParsed.data : undefined;
  const next = params.next ? safeNextPath(params.next) : undefined;
  const loginHref = next
    ? `/login?next=${encodeURIComponent(next)}`
    : '/login';

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
      <aside className="bg-rail px-8 py-12 text-rail-ink">
        <p className="font-display text-4xl leading-none">ReleaseOps</p>
        <p className="mt-4 max-w-[36ch] text-sm text-rail-ink/80">
          {inviteToken
            ? 'Create an account with the invited email, then join the workspace. This does not start a second studio.'
            : 'Create a workspace as an owner. Invite agents and clients from Team after you are in.'}
        </p>
      </aside>
      <main className="flex items-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[2.25rem] leading-none tracking-tight">
            {inviteToken ? 'Join with an invite' : 'Create a workspace'}
          </h1>
          <p className="mt-3 max-w-[65ch] text-sm text-ink-soft">
            {inviteToken
              ? 'Use the same email as the invite. After the account exists, open the invite link and join.'
              : 'You become the owner. Membership and roles stay in Postgres with the rest of the board.'}
          </p>
          <div className="mt-8 border border-line bg-board p-6">
            {isSupabaseConfigured() ? (
              <SignupForm
                inviteToken={inviteToken}
                email={params.email}
                next={next ?? (inviteToken ? `/invite/${inviteToken}` : undefined)}
              />
            ) : (
              <Alert>
                Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
              </Alert>
            )}
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Already have an account?{' '}
            <Link href={loginHref} className="font-semibold text-sea underline underline-offset-2">
              Sign in
            </Link>
            . For the seeded Harbor & Pine Studio board, use{' '}
            <code className="bg-white px-1">mira.owner@harborpine.test</code> /{' '}
            <code className="bg-white px-1">HarborPine!demo1</code> — do not keep creating new
            accounts (Supabase limits confirmation emails).
          </p>
        </div>
      </main>
    </div>
  );
}
