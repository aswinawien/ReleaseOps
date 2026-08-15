'use client';

import { useTransition } from 'react';
import { revokeInvitationAction } from '@/features/team/actions';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function RevokeInviteButton({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      loading={pending}
      onClick={() => {
        startTransition(async () => {
          await revokeInvitationAction(invitationId);
          router.refresh();
        });
      }}
    >
      Revoke
    </Button>
  );
}
