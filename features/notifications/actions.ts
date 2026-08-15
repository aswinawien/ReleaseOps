'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { actionErr, actionOk, type ActionResult } from '@/lib/actions/result';

export async function markNotificationReadAction(
  notificationId: string,
): Promise<ActionResult<{ id: string }>> {
  const context = await requireAppContext();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', context.userId)
    .select('id')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath('/notifications');
  revalidatePath('/dashboard');
  return actionOk({ id: data.id });
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<{ count: number }>> {
  const context = await requireAppContext();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', context.userId)
    .is('read_at', null)
    .select('id');

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath('/notifications');
  return actionOk({ count: data?.length ?? 0 });
}
