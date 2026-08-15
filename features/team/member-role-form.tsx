'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { MembershipRole } from '@/lib/supabase/database.types';
import { MEMBERSHIP_ROLES, canAssignRole } from '@/lib/auth/permissions';
import { updateMembershipRoleAction } from '@/features/team/actions';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export function MemberRoleForm({
  membershipId,
  currentRole,
  actorRole,
  isSelf,
  isLastOwner,
}: {
  membershipId: string;
  currentRole: MembershipRole;
  actorRole: MembershipRole;
  isSelf: boolean;
  isLastOwner: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const options = MEMBERSHIP_ROLES.filter((role) => canAssignRole(actorRole, currentRole, role));

  if (isSelf) {
    return <p className="text-sm text-ink-soft">You cannot change your own role.</p>;
  }

  if (options.length === 0 || (currentRole === 'owner' && isLastOwner)) {
    return <p className="text-sm text-ink-soft">Role is locked for this member.</p>;
  }

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const result = await updateMembershipRoleAction({
            membershipId,
            role: String(formData.get('role')),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {error ? <div className="w-full"><Alert>{error}</Alert></div> : null}
      <label className="grid gap-1 text-sm font-medium">
        Role
        <select
          name="role"
          defaultValue={currentRole}
          className="min-h-11 border border-line bg-white px-3 text-sm capitalize"
          disabled={pending}
        >
          {options.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="secondary" loading={pending}>
        Save role
      </Button>
    </form>
  );
}
