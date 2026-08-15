'use client';

import { useRouter } from 'next/navigation';
import type { TicketFilters as Filters } from '@/lib/validations/tickets';
import { ticketPriorities, ticketStatuses } from '@/lib/validations/tickets';
import { titleFromSlug } from '@/lib/utils';

export function TicketFilters({ filters }: { filters: Filters }) {
  const router = useRouter();

  function apply(formData: FormData) {
    const params = new URLSearchParams();
    const query = String(formData.get('q') ?? '').trim();
    const status = String(formData.get('status') ?? '');
    const priority = String(formData.get('priority') ?? '');
    if (query) params.set('q', query);
    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    router.push(`/tickets?${params.toString()}`);
  }

  return (
    <form action={apply} className="grid gap-3 rounded-xl border border-line bg-card p-4 md:grid-cols-4">
      <label className="grid gap-1 text-sm font-medium">
        Search
        <input
          name="q"
          defaultValue={filters.query}
          className="min-h-11 rounded-md border border-line bg-white px-3 text-sm"
          placeholder="Search titles"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Status
        <select
          name="status"
          defaultValue={filters.status ?? ''}
          className="min-h-11 rounded-md border border-line bg-white px-3 text-sm"
        >
          <option value="">Any</option>
          {ticketStatuses.map((status) => (
            <option key={status} value={status}>
              {titleFromSlug(status)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Priority
        <select
          name="priority"
          defaultValue={filters.priority ?? ''}
          className="min-h-11 rounded-md border border-line bg-white px-3 text-sm"
        >
          <option value="">Any</option>
          {ticketPriorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          className="min-h-11 w-full rounded-md bg-ink px-4 text-sm font-semibold text-white"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
