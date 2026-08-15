'use client';

import { useEffect } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid gap-4">
      <Alert>Something went wrong loading this page. The database was not changed.</Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
