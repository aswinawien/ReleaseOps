import { titleFromSlug } from '@/lib/utils';
import type { TicketPriority, TicketStatus } from '@/lib/supabase/database.types';
import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: TicketStatus }) {
  const tone =
    status === 'resolved' || status === 'closed'
      ? 'ok'
      : status === 'waiting_on_client'
        ? 'signal'
        : status === 'in_progress'
          ? 'sea'
          : 'neutral';

  return <Badge tone={tone}>{titleFromSlug(status)}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const tone = priority === 'urgent' || priority === 'high' ? 'danger' : 'neutral';
  return <Badge tone={tone}>{priority}</Badge>;
}
