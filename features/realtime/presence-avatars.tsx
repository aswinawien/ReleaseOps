import type { PresenceMember } from '@/lib/realtime/merge';

export function PresenceAvatars({ viewers }: { viewers: PresenceMember[] }) {
  if (viewers.length === 0) {
    return <p className="text-sm text-ink-soft">No one else is viewing this ticket.</p>;
  }

  return (
    <div aria-live="polite">
      <p className="text-sm font-medium text-ink">Currently viewing</p>
      <ul className="mt-2 flex flex-wrap gap-1">
        {viewers.map((viewer) => (
          <li key={viewer.userId} className="border border-line bg-white px-2 py-1 text-sm text-ink">
            {viewer.fullName}
          </li>
        ))}
      </ul>
    </div>
  );
}
