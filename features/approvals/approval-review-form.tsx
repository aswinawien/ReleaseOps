'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { reviewApprovalAction } from '@/features/approvals/actions';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export function ApprovalReviewForm({ approvalId }: { approvalId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-2 md:grid-cols-[12rem_minmax(0,1fr)_auto] md:items-end"
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const result = await reviewApprovalAction({
            approvalId,
            decision: String(formData.get('decision')),
            notes: String(formData.get('notes') ?? ''),
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {error ? (
        <div className="md:col-span-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      <Select
        label="Decision"
        name="decision"
        options={[
          { value: 'approved', label: 'Approve' },
          { value: 'changes_requested', label: 'Request changes' },
          { value: 'rejected', label: 'Reject' },
        ]}
      />
      <Input label="Review notes" name="notes" />
      <Button type="submit" loading={pending}>
        Submit review
      </Button>
    </form>
  );
}
