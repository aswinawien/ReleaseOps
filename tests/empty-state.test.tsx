import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('renders the title, description, and optional action', () => {
    render(
      <EmptyState
        title="No tickets yet"
        description="Create the first work order for this workspace."
        actionLabel="Create ticket"
        actionHref="/tickets/new"
      />,
    );

    expect(screen.getByRole('heading', { name: 'No tickets yet' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create ticket' })).toHaveAttribute(
      'href',
      '/tickets/new',
    );
  });
});
