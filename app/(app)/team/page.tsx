import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { canManageMembers } from '@/lib/auth/permissions';
import { listOrganizationMembers } from '@/lib/repositories/memberships';
import { listPendingInvitations } from '@/lib/repositories/invitations';
import { PageHeader } from '@/components/ui/page-header';
import { PermissionMatrix } from '@/components/team/permission-matrix';
import { MemberRoleForm } from '@/features/team/member-role-form';
import { InviteMemberForm } from '@/features/team/invite-member-form';
import { RevokeInviteButton } from '@/features/team/revoke-invite-button';
import { CopyInviteLink } from '@/features/team/copy-invite-link';
import { formatRelativeTime } from '@/lib/utils';

export const metadata = { title: 'Team' };

export default async function TeamPage() {
  const context = await requireAppContext();
  const supabase = await createClient();
  const [members, invites] = await Promise.all([
    listOrganizationMembers(supabase, context.organization.id),
    listPendingInvitations(supabase, context.organization.id),
  ]);
  const canManage = canManageMembers(context.role);
  const ownerCount = members.filter((member) => member.role === 'owner').length;

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Team"
        description={`${context.organization.name} memberships. Application checks and RLS use the same role names. Changing a role here updates the memberships row; policies are the last gate.`}
      />
      <section className="grid gap-3">
        <h2 className="font-display text-2xl leading-none">Invites</h2>
        {canManage ? (
          <InviteMemberForm actorRole={context.role} />
        ) : (
          <p className="text-sm text-ink-soft">Owners and admins send invite links.</p>
        )}
        {invites.length === 0 ? (
          <p className="text-sm text-ink-soft">No pending invites.</p>
        ) : (
          <div className="overflow-x-auto border border-line bg-board">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">Pending invitations</caption>
              <thead className="bg-rail text-rail-ink">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Role
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Expires
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-t border-line align-top">
                    <td className="px-3 py-3">{invite.email}</td>
                    <td className="px-3 py-3 capitalize">{invite.role}</td>
                    <td className="tabular px-3 py-3 text-ink-soft">
                      {formatRelativeTime(invite.expires_at)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="grid gap-2">
                        <CopyInviteLink token={invite.token} />
                        {canManage ? <RevokeInviteButton invitationId={invite.id} /> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl leading-none">Members</h2>
        <div className="overflow-x-auto border border-line bg-board">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <caption className="sr-only">Workspace members and roles</caption>
            <thead className="bg-rail text-rail-ink">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Member
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Role
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Joined
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Access
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = member.user_id === context.userId;
                const isLastOwner = member.role === 'owner' && ownerCount <= 1;
                return (
                  <tr key={member.id} className="border-t border-line align-top">
                    <td className="px-3 py-3 font-medium">
                      {member.profile?.full_name ?? member.user_id}
                      {isSelf ? <span className="ml-2 text-sm font-normal text-ink-soft">you</span> : null}
                    </td>
                    <td className="px-3 py-3 capitalize">{member.role}</td>
                    <td className="tabular px-3 py-3 text-ink-soft">
                      {formatRelativeTime(member.created_at)}
                    </td>
                    <td className="px-3 py-3">
                      {canManage ? (
                        <MemberRoleForm
                          membershipId={member.id}
                          currentRole={member.role}
                          actorRole={context.role}
                          isSelf={isSelf}
                          isLastOwner={isLastOwner}
                        />
                      ) : (
                        <p className="text-sm text-ink-soft">Owners and admins change roles.</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl leading-none">Role matrix</h2>
        <p className="max-w-[70ch] text-sm text-ink-soft">
          This table is the TypeScript contract in <code className="bg-white px-1">lib/auth/permissions.ts</code>.
          RLS policies in the migrations must agree. Admins cannot grant or edit the owner role. The
          workspace keeps at least one owner.
        </p>
        <PermissionMatrix />
      </section>
    </div>
  );
}
