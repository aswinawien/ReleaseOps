import { render, screen } from '@testing-library/react';
import { Alert } from '@/components/ui/alert';

describe('Alert', () => {
  it('exposes errors to assistive tech', () => {
    render(<Alert>Ticket details are invalid.</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Ticket details are invalid.');
  });
});
