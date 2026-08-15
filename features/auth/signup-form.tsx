'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signupAction({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      fullName: String(formData.get('fullName') ?? ''),
      organizationName: String(formData.get('organizationName') ?? ''),
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(result.data.redirectTo);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      {error ? <Alert>{error}</Alert> : null}
      <Input label="Full name" name="fullName" autoComplete="name" required />
      <Input
        label="Workspace name"
        name="organizationName"
        required
        placeholder="Harbor & Pine Studio"
      />
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
      />
      <Button type="submit" loading={loading}>
        Create workspace
      </Button>
    </form>
  );
}
