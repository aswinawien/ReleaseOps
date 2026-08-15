import { signOutAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="ghost" className="w-full justify-start px-3">
        Sign out
      </Button>
    </form>
  );
}
