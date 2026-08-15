import { ROLE_CAPABILITIES } from '@/lib/auth/permissions';

export function PermissionMatrix() {
  const roles = ['owner', 'admin', 'agent', 'client', 'viewer'] as const;

  return (
    <div className="overflow-x-auto border border-line bg-board">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">What each role can do</caption>
        <thead className="bg-rail text-rail-ink">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">
              Action
            </th>
            {roles.map((role) => (
              <th key={role} scope="col" className="px-3 py-2 font-semibold capitalize">
                {role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROLE_CAPABILITIES.map((row) => (
            <tr key={row.action} className="border-t border-line">
              <th scope="row" className="px-3 py-3 text-left font-medium">
                {row.action}
              </th>
              {roles.map((role) => (
                <td key={role} className="px-3 py-3">
                  {row[role] ? 'Yes' : 'No'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
