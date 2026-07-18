export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-civic-navy/5 text-civic-navy">
          <Icon size={22} />
        </span>
      )}
      <h3 className="font-display text-lg font-semibold text-civic-ink">{title}</h3>
      {message && <p className="max-w-sm text-sm text-civic-mist">{message}</p>}
      {action}
    </div>
  );
}
