export default function TicketNotFound() {
  return (
    <div className="rounded-xl border border-line bg-card p-8">
      <h1 className="font-display text-3xl">Ticket not found</h1>
      <p className="mt-2 text-ink-soft">
        This work order is missing, or it belongs to another workspace.
      </p>
    </div>
  );
}
