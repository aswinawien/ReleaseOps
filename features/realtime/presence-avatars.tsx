import type { PresenceMember } from '@/lib/realtime/merge';

export function PresenceAvatars({ viewers }: { viewers: PresenceMember[] }) {
  if (viewers.length === 0) {
    return <p className="text-sm text-ink-soft">No one else is viewing this ticket.</p>;
  }

  return (
    <div aria-live="polite">
      <p className="text-sm font-medium text-ink">Currently viewing</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {viewers.map((viewer) => (
          <li
            key={viewer.userId}
            className="rounded-full bg-sea/10 px-3 py-1 text-sm text-sea-dark"
          >
            {viewer.fullName}
          </li>
        ))}
      </ul>
    </div>
  );
}
