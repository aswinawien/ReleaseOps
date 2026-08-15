'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTicketAction } from '@/features/tickets/actions';
import { ticketPriorities } from '@/lib/validations/tickets';
import type { Project } from '@/lib/supabase/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';

export function TicketCreateForm({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const projectId = String(formData.get('projectId') ?? '');
    const result = await createTicketAction({
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? ''),
      priority: String(formData.get('priority') ?? 'medium'),
      projectId: projectId || null,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/tickets/${result.data.id}`);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-4 rounded-xl border border-line bg-card p-6">
      {error ? <Alert>{error}</Alert> : null}
      <Input label="Title" name="title" required minLength={4} maxLength={120} />
      <Textarea
        label="Description"
        name="description"
        required
        minLength={12}
        placeholder="What needs to happen, and how will we know it is done?"
      />
      <Select
        label="Priority"
        name="priority"
        defaultValue="medium"
        options={ticketPriorities.map((priority) => ({
          value: priority,
          label: priority,
        }))}
      />
      <Select
        label="Project"
        name="projectId"
        allowEmpty
        emptyLabel="No project"
        options={projects.map((project) => ({ value: project.id, label: project.name }))}
      />
      <Button type="submit" loading={loading}>
        Create ticket
      </Button>
    </form>
  );
}
