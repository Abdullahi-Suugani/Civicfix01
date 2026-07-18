export function ReportCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-36 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-6 w-24" />
      </div>
    </div>
  );
}

export function ReportGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ReportCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="skeleton mb-3 h-3 w-1/2" />
      <div className="skeleton h-8 w-1/3" />
    </div>
  );
}
