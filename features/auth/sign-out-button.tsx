import { signOutAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';

export function SignOutButton({ variant = 'ghost' }: { variant?: 'ghost' | 'rail' }) {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant={variant} className="min-h-11 px-3">
        Sign out
      </Button>
    </form>
  );
}
