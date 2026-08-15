export function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <p className="sr-only">No one is typing.</p>;
  }

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : `${names.slice(0, -1).join(', ')} and ${names.at(-1)} are typing`;

  return (
    <p className="text-sm italic text-ink-soft" aria-live="polite">
      {label}…
    </p>
  );
}
