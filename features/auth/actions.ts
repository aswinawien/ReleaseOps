'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { actionErr, actionOk, type ActionResult } from '@/lib/actions/result';
import { loginSchema, signupSchema } from '@/lib/validations/auth';

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug.length >= 2 ? slug : `workspace-${crypto.randomUUID().slice(0, 8)}`;
}

export async function loginAction(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  if (!isSupabaseConfigured()) {
    return actionErr('Supabase is not configured. Copy .env.example to .env.local.');
  }

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Check your email and password.');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return actionErr(error.message);
  }

  return actionOk({ redirectTo: '/dashboard' });
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

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return actionErr(error.message);
  }

  const userId = data.user?.id;
  if (userId) {
    const slug = `${slugify(parsed.data.organizationName)}-${userId.slice(0, 6)}`;
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: parsed.data.organizationName, slug })
      .select('id')
      .single();

    if (orgError) {
      return actionErr(orgError.message);
    }

    const { error: membershipError } = await supabase.from('memberships').insert({
      organization_id: organization.id,
      user_id: userId,
      role: 'owner',
    });

    if (membershipError) {
      return actionErr(membershipError.message);
    }
  }

  if (!data.session) {
    return actionErr(
      'Account created. Confirm the email if your project requires it, then sign in.',
    );
  }

  return actionOk({ redirectTo: '/dashboard' });
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
