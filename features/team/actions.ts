'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { canAssignRole, canInviteRole } from '@/lib/auth/permissions';
import { actionErr, actionOk, type ActionResult } from '@/lib/actions/result';
import {
  createInvitationSchema,
  invitationTokenSchema,
  updateMembershipRoleSchema,
} from '@/lib/validations/memberships';
import { listOrganizationMembers } from '@/lib/repositories/memberships';
import { createAdminClient } from '@/lib/supabase/admin';
import { getInvitationPreview } from '@/lib/repositories/invitations';

export async function updateMembershipRoleAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateMembershipRoleSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Role change is invalid.');
  }

  const context = await requireAppContext();
  const supabase = await createClient();
  const members = await listOrganizationMembers(supabase, context.organization.id);
  const membership = members.find((member) => member.id === parsed.data.membershipId);

  if (!membership || membership.organization_id !== context.organization.id) {
    return actionErr('Member not found.');
  }

  if (membership.user_id === context.userId) {
    return actionErr('You cannot change your own role.');
  }

  if (!canAssignRole(context.role, membership.role, parsed.data.role)) {
    return actionErr('Your role cannot make that change.');
  }

  const ownerCount = members.filter((member) => member.role === 'owner').length;
  if (membership.role === 'owner' && parsed.data.role !== 'owner' && ownerCount <= 1) {
    return actionErr('The workspace must keep at least one owner.');
  }

  const { data, error } = await supabase
    .from('memberships')
    .update({ role: parsed.data.role })
    .eq('id', membership.id)
    .eq('organization_id', context.organization.id)
    .select('id')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath('/team');
  revalidatePath('/', 'layout');
  return actionOk({ id: data.id });
}

export async function createInvitationAction(
  input: unknown,
): Promise<ActionResult<{ token: string }>> {
  const parsed = createInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Invite is invalid.');
  }

  const context = await requireAppContext();
  if (!canInviteRole(context.role, parsed.data.role)) {
    return actionErr('Your role cannot send that invite.');
  }

  const supabase = await createClient();
  const email = parsed.data.email.toLowerCase();

  const { data: existing } = await supabase
    .from('invitations')
    .select('id')
    .eq('organization_id', context.organization.id)
    .ilike('email', email)
    .is('accepted_at', null)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('invitations')
      .update({
        role: parsed.data.role,
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', existing.id)
      .select('token')
      .single();
    if (error) {
      return actionErr(error.message);
    }
    revalidatePath('/team');
    return actionOk({ token: data.token });
  }

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: context.organization.id,
      email,
      role: parsed.data.role,
      invited_by: context.userId,
    })
    .select('token')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath('/team');
  return actionOk({ token: data.token });
}

export async function revokeInvitationAction(
  invitationId: string,
): Promise<ActionResult<{ id: string }>> {
  const context = await requireAppContext();
  if (!canInviteRole(context.role, 'viewer')) {
    return actionErr('Your role cannot revoke invites.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)
    .eq('organization_id', context.organization.id)
    .select('id')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath('/team');
  return actionOk({ id: data.id });
}

export async function acceptInvitationAction(
  token: string,
): Promise<ActionResult<{ organizationId: string }>> {
  const parsed = invitationTokenSchema.safeParse(token);
  if (!parsed.success) {
    return actionErr('That invite link is not valid.');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return actionErr('Sign in with the invited email, then open this link again.');
  }

  const preview = await getInvitationPreview(supabase, parsed.data);
  if (!preview) {
    return actionErr('Invite not found.');
  }
  if (preview.accepted_at) {
    return actionErr('This invite was already accepted.');
  }
  if (new Date(preview.expires_at).getTime() < Date.now()) {
    return actionErr('This invite has expired. Ask an owner or admin to send a new one.');
  }
  if (user.email.toLowerCase() !== preview.email.toLowerCase()) {
    return actionErr(`Sign in as ${preview.email} to accept this invite.`);
  }

  const admin = createAdminClient();
  const { data: invite, error: inviteError } = await admin
    .from('invitations')
    .select('*')
    .eq('token', parsed.data)
    .maybeSingle();

  if (inviteError || !invite) {
    return actionErr(inviteError?.message ?? 'Invite not found.');
  }

  const { error: membershipError } = await admin.from('memberships').insert({
    organization_id: invite.organization_id,
    user_id: user.id,
    role: invite.role,
  });

  if (membershipError && !membershipError.message.toLowerCase().includes('duplicate')) {
    return actionErr(membershipError.message);
  }

  const { error: acceptError } = await admin
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  if (acceptError) {
    return actionErr(acceptError.message);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/team');
  return actionOk({ organizationId: invite.organization_id });
}
