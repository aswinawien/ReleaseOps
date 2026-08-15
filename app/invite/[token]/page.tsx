import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getInvitationPreview } from '@/lib/repositories/invitations';
import { AcceptInviteButton } from '@/features/team/accept-invite-button';
import { Alert } from '@/components/ui/alert';
import { titleFromSlug } from '@/lib/utils';

export const metadata = { title: 'Workspace invite' };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let preview = null;
  try {
    preview = await getInvitationPreview(supabase, token);
  } catch {
    preview = null;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
      <aside className="bg-rail px-8 py-12 text-rail-ink">
        <p className="font-display text-4xl leading-none">ReleaseOps</p>
        <p className="mt-4 max-w-[36ch] text-sm text-rail-ink/80">
          A teammate invited you with a shareable link. No extra email API.
        </p>
      </aside>
      <main className="flex items-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[2.25rem] leading-none tracking-tight">Join a workspace</h1>
          {!preview ? (
            <div className="mt-8">
              <Alert>This invite link is missing or invalid.</Alert>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 border border-line bg-board p-6">
              <p>
                <span className="font-semibold">{preview.organization_name}</span> invited{' '}
                <code className="bg-white px-1">{preview.email}</code> as{' '}
                <span className="capitalize">{titleFromSlug(preview.role)}</span>.
              </p>
              {preview.accepted_at ? (
                <Alert tone="info">This invite was already accepted. Sign in to open the board.</Alert>
              ) : new Date(preview.expires_at).getTime() < Date.now() ? (
                <Alert>This invite expired. Ask an owner or admin for a new link.</Alert>
              ) : user ? (
                <div className="grid gap-3">
                  <p className="text-sm text-ink-soft">
                    Signed in as <code className="bg-white px-1">{user.email}</code>. Join only
                    works if that matches the invite.
                  </p>
                  <AcceptInviteButton token={token} />
                </div>
              ) : (
                <p className="text-sm text-ink-soft">
                  <Link
                    href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}
                    className="font-semibold text-sea underline underline-offset-2"
                  >
                    Sign in
                  </Link>{' '}
                  or{' '}
                  <Link
                    href={`/signup?invite=${token}&email=${encodeURIComponent(preview.email)}&next=${encodeURIComponent(`/invite/${token}`)}`}
                    className="font-semibold text-sea underline underline-offset-2"
                  >
                    create an account
                  </Link>{' '}
                  with <code className="bg-white px-1">{preview.email}</code>, then join.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
