import { redirect } from 'next/navigation';
import { getAppContext } from '@/lib/auth/session';
import { isSupabaseConfigured } from '@/lib/env';

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect('/login');
  }
  const context = await getAppContext();
  redirect(context ? '/dashboard' : '/login');
}
