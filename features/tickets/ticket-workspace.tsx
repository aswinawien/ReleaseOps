'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { MembershipRole } from '@/lib/supabase/database.types';
import type {
  ActivityWithActor,
  ApprovalWithActors,
  CommentWithAuthor,
  MembershipWithProfile,
  TicketWithRelations,
} from '@/lib/supabase/database.types';
import {
  canAssignTicket,
  canChangeTicketPriority,
  canChangeTicketStatus,
  canComment,
  canRequestApproval,
  canReviewApproval,
} from '@/lib/auth/permissions';
import { ticketPriorities, ticketStatuses } from '@/lib/validations/tickets';
import { titleFromSlug } from '@/lib/utils';
import { useTicketRealtime } from '@/features/realtime/use-ticket-realtime';
import { PresenceAvatars } from '@/features/realtime/presence-avatars';
import { TypingIndicator } from '@/features/realtime/typing-indicator';
import {
  assignTicketAction,
  updateTicketPriorityAction,
  updateTicketStatusAction,
} from '@/features/tickets/actions';
import { createCommentAction } from '@/features/comments/actions';
import { requestApprovalAction, reviewApprovalAction } from '@/features/approvals/actions';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge, PriorityBadge } from '@/components/tickets/status-badge';
import { formatRelativeTime } from '@/lib/utils';
import { connectionStatusLabel } from '@/lib/realtime/connection-state';

type TicketWorkspaceProps = {
  role: MembershipRole;
  userId: string;
  fullName: string;
  initialTicket: TicketWithRelations;
  initialComments: CommentWithAuthor[];
  initialActivity: ActivityWithActor[];
  initialApprovals: ApprovalWithActors[];
  assignableMembers: MembershipWithProfile[];
};

export function TicketWorkspace({
  role,
  userId,
  fullName,
  initialTicket,
  initialComments,
  initialActivity,
  initialApprovals,
  assignableMembers,
}: TicketWorkspaceProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onReconcile = useCallback(async () => {
    router.refresh();
  }, [router]);

  const realtime = useTicketRealtime({
    ticketId: initialTicket.id,
    userId,
    fullName,
    initialTicket,
    initialComments,
    initialActivity,
    initialApprovals,
    onReconcile,
  });

  const comments = realtime.comments as CommentWithAuthor[];
  const activity = realtime.activity as ActivityWithActor[];
  const approvals = realtime.approvals as ApprovalWithActors[];
  const ticket = realtime.ticket as TicketWithRelations;

  const staffOptions = useMemo(
    () =>
      assignableMembers.map((member) => ({
        value: member.user_id,
        label: member.profile?.full_name ?? member.user_id,
      })),
    [assignableMembers],
  );

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid gap-6">
        <header className="border border-line bg-board p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <h1 className="font-display text-[2.25rem] leading-none tracking-tight">{ticket.title}</h1>
              <p className="mt-3 text-sm text-ink-soft">
                Opened by {ticket.creator?.full_name ?? 'Unknown'} ·{' '}
                <span className="tabular">{formatRelativeTime(ticket.created_at)}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
          <p className="mt-4 max-w-[70ch] whitespace-pre-wrap text-ink">{ticket.description}</p>
          <p className="mt-4 text-xs text-ink-soft" aria-live="polite">
            {connectionStatusLabel(realtime.status)}. Database writes still succeed if the socket
            drops.
          </p>
        </header>

        {error ? <Alert>{error}</Alert> : null}

        <section className="grid gap-4 border border-line bg-board p-5 md:grid-cols-3">
          {canChangeTicketStatus(role) ? (
            <form
              className="grid gap-2"
              action={(formData) =>
                run(() =>
                  updateTicketStatusAction({
                    ticketId: ticket.id,
                    status: String(formData.get('status')),
                  }),
                )
              }
            >
              <Select
                label="Status"
                name="status"
                defaultValue={ticket.status}
                options={ticketStatuses.map((status) => ({
                  value: status,
                  label: titleFromSlug(status),
                }))}
              />
              <Button type="submit" variant="secondary" loading={pending}>
                Update status
              </Button>
            </form>
          ) : (
            <p className="text-sm text-ink-soft">Status is managed by the studio team.</p>
          )}
          {canChangeTicketPriority(role) ? (
            <form
              className="grid gap-2"
              action={(formData) =>
                run(() =>
                  updateTicketPriorityAction({
                    ticketId: ticket.id,
                    priority: String(formData.get('priority')),
                  }),
                )
              }
            >
              <Select
                label="Priority"
                name="priority"
                defaultValue={ticket.priority}
                options={ticketPriorities.map((priority) => ({
                  value: priority,
                  label: priority,
                }))}
              />
              <Button type="submit" variant="secondary" loading={pending}>
                Update priority
              </Button>
            </form>
          ) : (
            <p className="text-sm text-ink-soft">Priority: {ticket.priority}</p>
          )}
          {canAssignTicket(role) ? (
            <form
              className="grid gap-2"
              action={(formData) => {
                const assignedTo = String(formData.get('assignedTo') ?? '');
                run(() =>
                  assignTicketAction({
                    ticketId: ticket.id,
                    assignedTo: assignedTo || null,
                  }),
                );
              }}
            >
              <Select
                label="Assignee"
                name="assignedTo"
                allowEmpty
                emptyLabel="Unassigned"
                defaultValue={ticket.assigned_to ?? ''}
                options={staffOptions}
              />
              <Button type="submit" variant="secondary" loading={pending}>
                Save assignment
              </Button>
            </form>
          ) : (
            <p className="text-sm text-ink-soft">
              Assigned to {ticket.assignee?.full_name ?? 'nobody yet'}
            </p>
          )}
        </section>

        <section className="border border-line bg-board p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl leading-none">Approvals</h2>
            <Link href="/approvals" className="text-sm font-semibold text-sea underline underline-offset-2">
              Open approvals board
            </Link>
          </div>
          {approvals.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">No approval requests yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border border-line">
              {approvals.map((approval) => (
                <li key={approval.id} className="p-3">
                  <p className="text-sm">
                    {titleFromSlug(approval.status)} · requested by{' '}
                    {approval.requester?.full_name ?? 'Unknown'}
                  </p>
                  {approval.notes ? (
                    <p className="mt-1 text-sm text-ink-soft">{approval.notes}</p>
                  ) : null}
                  {approval.status === 'pending' && canReviewApproval(role) ? (
                    <form
                      className="mt-3 grid gap-2"
                      action={(formData) =>
                        run(() =>
                          reviewApprovalAction({
                            approvalId: approval.id,
                            decision: String(formData.get('decision')),
                            notes: String(formData.get('notes') ?? ''),
                          }),
                        )
                      }
                    >
                      <Select
                        label="Decision"
                        name="decision"
                        options={[
                          { value: 'approved', label: 'Approve' },
                          { value: 'changes_requested', label: 'Request changes' },
                          { value: 'rejected', label: 'Reject' },
                        ]}
                      />
                      <Textarea label="Review notes" name="notes" />
                      <Button type="submit" loading={pending}>
                        Submit review
                      </Button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {canRequestApproval(role) ? (
            <form
              className="mt-4 grid gap-2"
              action={(formData) =>
                run(() =>
                  requestApprovalAction({
                    ticketId: ticket.id,
                    notes: String(formData.get('notes') ?? ''),
                  }),
                )
              }
            >
              <Textarea label="Request notes" name="notes" />
              <Button type="submit" variant="secondary" loading={pending}>
                Request approval
              </Button>
            </form>
          ) : null}
        </section>

        <section className="border border-line bg-board p-5">
          <h2 className="font-display text-2xl leading-none">Comments</h2>
          {comments.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No comments yet"
                description="Start the thread. Other members will see new comments over the live socket, then the database refresh."
              />
            </div>
          ) : (
            <ol className="mt-4 divide-y divide-line border border-line" aria-live="polite">
              {comments.map((comment) => (
                <li key={comment.id} className="px-4 py-3">
                  <p className="text-sm font-semibold">
                    {comment.author?.full_name ?? 'Unknown'}
                    <span className="ml-2 font-normal text-ink-soft tabular">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </p>
                  <p className="mt-1 max-w-[70ch] whitespace-pre-wrap">{comment.body}</p>
                </li>
              ))}
            </ol>
          )}
          <TypingIndicator names={realtime.typingNames} />
          {canComment(role) ? (
            <form
              className="mt-4 grid gap-3"
              action={(formData) =>
                run(() =>
                  createCommentAction({
                    ticketId: ticket.id,
                    body: String(formData.get('body') ?? ''),
                  }),
                )
              }
            >
              <Textarea
                label="Add a comment"
                name="body"
                required
                minLength={2}
                onFocus={() => realtime.sendTyping(true)}
                onChange={() => realtime.sendTyping(true)}
                onBlur={() => realtime.sendTyping(false)}
              />
              <Button type="submit" loading={pending}>
                Post comment
              </Button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">Viewers can read comments but cannot post.</p>
          )}
        </section>
      </div>

      <aside className="grid h-fit gap-6">
        <section className="border border-line bg-board p-4">
          <h2 className="font-display text-xl leading-none">Presence</h2>
          <div className="mt-3">
            <PresenceAvatars viewers={realtime.viewers} />
          </div>
        </section>
        <section className="border border-line bg-board p-4">
          <h2 className="font-display text-xl leading-none">Activity</h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">No recorded events yet.</p>
          ) : (
            <ol className="mt-3 divide-y divide-line border-t border-line">
              {activity.map((event) => (
                <li key={event.id} className="py-3 text-sm">
                  <p className="font-medium">{titleFromSlug(event.event_type)}</p>
                  <p className="text-ink-soft">
                    {event.actor?.full_name ?? 'System'} ·{' '}
                    <span className="tabular">{formatRelativeTime(event.created_at)}</span>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </aside>
    </div>
  );
}
