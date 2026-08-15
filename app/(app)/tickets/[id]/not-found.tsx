export default function TicketNotFound() {
  return (
    <div className="border border-line bg-board p-8">
      <h1 className="font-display text-3xl leading-none tracking-tight">Ticket not found</h1>
      <p className="mt-3 max-w-[65ch] text-sm text-ink-soft">
        This work order is missing, or it belongs to another workspace.
      </p>
    </div>
  );
}
