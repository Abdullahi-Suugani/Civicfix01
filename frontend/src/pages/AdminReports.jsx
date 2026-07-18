import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Download, Trash2, ExternalLink } from "lucide-react";
import api from "../api/client";
import AdminNav from "../components/AdminNav";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import { STATUSES, PRIORITIES } from "../constants";
import { format } from "date-fns";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(() => {
    setLoading(true);
    api
      .get("/reports", { params: { search, status, priority, page, limit: 15, sort: "newest" } })
      .then(({ data }) => {
        setReports(data.reports);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [search, status, priority, page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  async function changeStatus(id, newStatus) {
    try {
      await api.put(`/reports/${id}`, { status: newStatus });
      toast.success("Status updated.");
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update status.");
    }
  }

  async function changePriority(id, newPriority) {
    try {
      await api.put(`/reports/${id}`, { priority: newPriority });
      toast.success("Priority updated.");
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update priority.");
    }
  }

  async function removeReport(id) {
    if (!confirm("Delete this report? This can't be undone.")) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.success("Report deleted.");
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete this report.");
    }
  }

  function exportCsv() {
    const header = ["Title", "Category", "Status", "Priority", "Reporter", "Address", "Created At"];
    const rows = reports.map((r) => [
      r.title,
      r.category?.name,
      r.status,
      r.priority,
      r.isAnonymous ? "Anonymous" : r.user?.fullName || "",
      r.address || "",
      r.createdAt,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `civicfix-reports-page${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 font-display text-3xl font-bold text-civic-ink">Manage reports</h1>
      <p className="mb-6 text-sm text-civic-mist">{pagination.total} reports on record.</p>
      <AdminNav />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-civic-mist" />
          <input
            className="input pl-8"
            placeholder="Search reports…"
            onKeyDown={(e) => e.key === "Enter" && (setSearch(e.currentTarget.value), setPage(1))}
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <button onClick={exportCsv} className="btn-outline">
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="border-b border-civic-line text-xs uppercase tracking-wide text-civic-mist">
            <tr>
              <th className="p-3">Report</th>
              <th className="p-3">Reporter</th>
              <th className="p-3">Status</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Filed</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-civic-line">
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-civic-mist">Loading…</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-civic-mist">No reports match those filters.</td></tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id}>
                  <td className="p-3">
                    <p className="font-medium text-civic-ink line-clamp-1 max-w-[220px]">{r.title}</p>
                    <p className="text-xs text-civic-mist">{r.category?.name}</p>
                  </td>
                  <td className="p-3 text-civic-mist">{r.isAnonymous ? "Anonymous" : r.user?.fullName || "—"}</td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) => changeStatus(r.id, e.target.value)}
                      className="rounded-md border border-civic-line bg-white px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={r.priority}
                      onChange={(e) => changePriority(r.id, e.target.value)}
                      className="rounded-md border border-civic-line bg-white px-2 py-1 text-xs"
                    >
                      {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </td>
                  <td className="p-3 font-mono text-xs text-civic-mist">{format(new Date(r.createdAt), "MMM d, yyyy")}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Link to={`/reports/${r.id}`} className="btn-ghost !p-1.5"><ExternalLink size={14} /></Link>
                      <button onClick={() => removeReport(r.id)} className="btn-ghost !p-1.5 text-civic-red"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pagination.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${page === i + 1 ? "bg-civic-navy text-white" : "border border-civic-line text-civic-mist"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
