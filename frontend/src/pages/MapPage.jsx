import { useEffect, useState } from "react";
import api from "../api/client";
import ReportsMap from "../components/ReportsMap";
import { STATUSES } from "../constants";

export default function MapPage() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/reports", { params: { status: statusFilter, limit: 100 } })
      .then(({ data }) => setReports(data.reports))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-civic-ink">Live issue map</h1>
          <p className="mt-1 text-sm text-civic-mist">Red = pending · Amber = in progress · Green = resolved · Gray = rejected</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="skeleton h-[600px] w-full" />
      ) : (
        <ReportsMap reports={reports} height="600px" zoom={12} />
      )}
    </div>
  );
}
