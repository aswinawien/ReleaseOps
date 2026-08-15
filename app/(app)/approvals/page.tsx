import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { canReviewApproval } from '@/lib/auth/permissions';
import {
  countApprovalsByStatus,
  listOrganizationApprovals,
} from '@/lib/repositories/approvals';
import { approvalFilterSchema, approvalStatuses } from '@/lib/validations/approvals';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { ApprovalReviewForm } from '@/features/approvals/approval-review-form';
import { formatRelativeTime, titleFromSlug } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ApprovalStatus } from '@/lib/supabase/database.types';

export const metadata = { title: 'Approvals' };

function approvalTone(status: ApprovalStatus) {
  if (status === 'approved') {
    return 'ok' as const;
  }
  if (status === 'pending') {
    return 'signal' as const;
  }
  if (status === 'rejected') {
    return 'danger' as const;
  }
  return 'neutral' as const;
}

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = approvalFilterSchema.catch({ status: 'pending' }).parse({
    status: typeof params.status === 'string' && params.status ? params.status : 'pending',
  });
  const statusFilter = parsed.status === 'all' ? undefined : parsed.status;

  const context = await requireAppContext();
  const supabase = await createClient();
  const [approvals, counts] = await Promise.all([
    listOrganizationApprovals(supabase, context.organization.id, statusFilter),
    countApprovalsByStatus(supabase, context.organization.id),
  ]);
  const canReview = canReviewApproval(context.role);
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Approvals"
        description="Studio staff request a sign-off. Clients, owners, and admins review it. The row is written to Postgres first."
      />
      <nav aria-label="Approvals by status" className="flex flex-wrap gap-1 border border-line bg-board p-1">
        <Link
          href="/approvals?status=all"
          className={cn(
            'inline-flex min-h-11 items-center gap-2 px-3 text-sm',
            parsed.status === 'all' ? 'bg-rail text-rail-ink' : 'text-ink hover:bg-white',
          )}
          aria-current={parsed.status === 'all' ? 'page' : undefined}
        >
          All
          <span className="tabular">{total}</span>
        </Link>
        {approvalStatuses.map((status) => {
          const selected = parsed.status === status;
          return (
            <Link
              key={status}
              href={`/approvals?status=${status}`}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 px-3 text-sm',
                selected ? 'bg-rail text-rail-ink' : 'text-ink hover:bg-white',
              )}
              aria-current={selected ? 'page' : undefined}
            >
              {titleFromSlug(status)}
              <span className="tabular">{counts[status] ?? 0}</span>
            </Link>
          );
        })}
      </nav>
      {approvals.length === 0 ? (
        <EmptyState
          title="No approvals in this filter"
          description="Agents request approval from a ticket. Pending rows show up here for the client or a manager to review."
        />
      ) : (
        <div className="overflow-x-auto border border-line bg-board">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <caption className="sr-only">Approval requests</caption>
            <thead className="bg-rail text-rail-ink">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Work order
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Requested by
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Notes
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => (
                <tr key={approval.id} className="border-t border-line align-top">
                  <td className="px-3 py-3">
                    {approval.ticket ? (
                      <Link
                        href={`/tickets/${approval.ticket.id}`}
                        className="font-medium text-ink underline-offset-2 hover:underline"
                      >
                        {approval.ticket.title}
                      </Link>
                    ) : (
                      <span className="text-ink-soft">Ticket removed</span>
                    )}
                    {approval.status === 'pending' && canReview ? (
                      <div className="mt-3 max-w-xl">
                        <ApprovalReviewForm approvalId={approval.id} />
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-ink-soft">
                    {approval.requester?.full_name ?? 'Unknown'}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={approvalTone(approval.status)}>{titleFromSlug(approval.status)}</Badge>
                  </td>
                  <td className="max-w-xs px-3 py-3 text-ink-soft">{approval.notes ?? '—'}</td>
                  <td className="tabular px-3 py-3 text-ink-soft">
                    {formatRelativeTime(approval.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!canReview ? (
        <p className="text-sm text-ink-soft">
          Your role can read this board. Clients, owners, and admins submit the review.
        </p>
      ) : null}
    </div>
  );
}
