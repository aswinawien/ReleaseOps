'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInvitationAction } from '@/features/team/actions';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-3">
      {error ? <Alert>{error}</Alert> : null}
      <Button
        type="button"
        loading={pending}
        onClick={() => {
          startTransition(async () => {
            setError(null);
            const result = await acceptInvitationAction(token);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.push('/dashboard');
            router.refresh();
          });
        }}
      >
        Join workspace
      </Button>
    </div>
  );
}
