'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { actionErr, actionOk, fromUnknownError, type ActionResult } from '@/lib/actions/result';
import { loginSchema, signupSchema } from '@/lib/validations/auth';
import { bootstrapOwnerWorkspace } from '@/lib/auth/create-workspace';
import { safeNextPath } from '@/lib/utils';

export async function loginAction(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  if (!isSupabaseConfigured()) {
    return actionErr('Supabase is not configured. Copy .env.example to .env.local.');
  }

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Check your email and password.');
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return actionErr(error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('fetch failed') || message.includes('ENOTFOUND')) {
      return actionErr(
        'Could not reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env and restart npm run dev.',
      );
    }
    return fromUnknownError(error, 'Sign in failed.');
  }

  revalidatePath('/', 'layout');
  redirect(safeNextPath(parsed.data.next));
}

export async function signupAction(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  if (!isSupabaseConfigured()) {
    return actionErr('Supabase is not configured. Copy .env.example to .env.local.');
  }

  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Check the signup form.');
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const afterAuth = safeNextPath(
    parsed.data.next ??
      (parsed.data.inviteToken ? `/invite/${parsed.data.inviteToken}` : '/dashboard'),
  );

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(afterAuth)}`,
    },
  });

    if (error) {
      const lowered = error.message.toLowerCase();
      if (lowered.includes('rate limit')) {
        return actionErr(
          'Supabase is blocking more signup emails from this project for a bit. Use Sign in with the seeded demo owner instead of creating another account.',
        );
      }
      const already =
        lowered.includes('already registered') || lowered.includes('already been registered');
      if (already) {
      const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (signInError || !signedIn.user) {
        return actionErr('That email already has an account. Sign in with the same password.');
      }
      if (!parsed.data.inviteToken) {
        const workspace = await bootstrapOwnerWorkspace(
          signedIn.user.id,
          parsed.data.organizationName,
        );
        if (!workspace.ok) {
          return workspace;
        }
      }
      revalidatePath('/', 'layout');
      return actionOk({
        redirectTo: safeNextPath(
          parsed.data.next ??
            (parsed.data.inviteToken ? `/invite/${parsed.data.inviteToken}` : '/dashboard'),
        ),
      });
    }
    return actionErr(error.message);
  }

  const userId = data.user?.id;
  if (userId && !parsed.data.inviteToken) {
    const workspace = await bootstrapOwnerWorkspace(userId, parsed.data.organizationName);
    if (!workspace.ok) {
      return workspace;
    }
  }

  const redirectTo = safeNextPath(
    parsed.data.next ??
      (parsed.data.inviteToken ? `/invite/${parsed.data.inviteToken}` : '/dashboard'),
  );

  if (!data.session) {
    return actionErr(
      parsed.data.inviteToken
        ? 'Account created. Confirm the email if required, then open the invite link again.'
        : 'Account created. Confirm the email if your project requires it, then sign in.',
    );
  }

  return actionOk({ redirectTo });
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
