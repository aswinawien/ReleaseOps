'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { MembershipRole } from '@/lib/supabase/database.types';
import { MEMBERSHIP_ROLES, canInviteRole } from '@/lib/auth/permissions';
import { createInvitationAction } from '@/features/team/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { CopyInviteLink } from '@/features/team/copy-invite-link';

export function InviteMemberForm({ actorRole }: { actorRole: MembershipRole }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const roles = MEMBERSHIP_ROLES.filter((role) => canInviteRole(actorRole, role));

  return (
    <div className="grid gap-3 border border-line bg-board p-4">
      <form
        className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_auto] md:items-end"
        action={(formData) => {
          startTransition(async () => {
            setError(null);
            setToken(null);
            const result = await createInvitationAction({
              email: String(formData.get('email') ?? ''),
              role: String(formData.get('role')),
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setToken(result.data.token);
            router.refresh();
          });
        }}
      >
        {error ? (
          <div className="md:col-span-3">
            <Alert>{error}</Alert>
          </div>
        ) : null}
        <Input label="Invite email" name="email" type="email" required autoComplete="email" />
        <label className="grid gap-1.5 text-sm font-medium">
          Role
          <select name="role" className="min-h-11 border border-line bg-white px-3 text-sm capitalize" defaultValue="client">
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" loading={pending}>
          Create invite link
        </Button>
      </form>
      <p className="text-sm text-ink-soft">
        This does not send email (Supabase signup mail is rate-limited). Copy the link and share it.
        They must sign in with that same email.
      </p>
      {token ? <CopyInviteLink token={token} /> : null}
    </div>
  );
}
