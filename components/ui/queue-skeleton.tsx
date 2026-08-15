export function QueueSkeleton({ label = 'Loading board' }: { label?: string }) {
  return (
    <div role="status" aria-busy="true" className="grid gap-3">
      <span className="sr-only">{label}</span>
      <div className="h-11 border border-line bg-board" />
      <div className="border border-line bg-board">
        <div className="h-9 bg-rail" />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-14 border-t border-line bg-board" />
        ))}
      </div>
    </div>
  );
}
