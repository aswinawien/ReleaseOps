export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-ink-soft" role="status">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-sea border-t-transparent"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
