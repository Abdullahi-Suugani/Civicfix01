import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, LayoutGrid, List, SlidersHorizontal, Sparkles } from "lucide-react";
import api from "../api/client";
import ReportCard from "../components/ReportCard";
import { ReportGridSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import { STATUSES, PRIORITIES } from "../constants";
import { Link } from "react-router-dom";

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [aiSearchInfo, setAiSearchInfo] = useState(null);

  const search = searchParams.get("search") || "";
  const aiSearch = searchParams.get("aiSearch") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const fetchReports = useCallback(() => {
    setLoading(true);
    api
      .get("/reports", { params: { search, aiSearch, category, status, priority, sort, page, limit: 9 } })
      .then(({ data }) => {
        setReports(data.reports);
        setPagination(data.pagination);
        setAiSearchInfo(data.aiSearch || null);
      })
      .finally(() => setLoading(false));
  }, [search, aiSearch, category, status, priority, sort, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-civic-ink">Community reports</h1>
          <p className="mt-1 text-sm text-civic-mist">{pagination.total} reports on record</p>
        </div>
        <Link to="/submit-report" className="btn-primary">
          Report an issue
        </Link>
      </div>

      {/* Search + toggle */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Sparkles size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-civic-teal" />
          <input
            defaultValue={aiSearch}
            onKeyDown={(e) => e.key === "Enter" && updateParam("aiSearch", e.currentTarget.value)}
            onBlur={(e) => updateParam("aiSearch", e.currentTarget.value)}
            placeholder="Ask AI: Show urgent road problems near the university"
            className="input pl-9"
          />
        </div>
      </div>

      {aiSearchInfo && (
        <p className="mb-4 text-xs text-civic-mist">
          AI interpreted this as: {aiSearchInfo.priority || "any priority"} {aiSearchInfo.category || "issues"}
          {aiSearchInfo.locationHint ? ` near ${aiSearchInfo.locationHint}` : ""}.
        </p>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-civic-mist" />
          <input
            defaultValue={search}
            onKeyDown={(e) => e.key === "Enter" && updateParam("search", e.currentTarget.value)}
            onBlur={(e) => updateParam("search", e.currentTarget.value)}
            placeholder="Search by title, description, or address…"
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className="input w-auto">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Priority</option>
          </select>
          <div className="flex rounded-lg border border-civic-line bg-white p-1">
            <button
              onClick={() => setView("grid")}
              className={`rounded-md p-1.5 ${view === "grid" ? "bg-civic-navy text-white" : "text-civic-mist"}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-md p-1.5 ${view === "list" ? "bg-civic-navy text-white" : "text-civic-mist"}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        {/* Filters */}
        <aside className="card h-fit space-y-6 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-civic-ink">
            <SlidersHorizontal size={15} /> Filters
          </div>

          <div>
            <p className="label">Category</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => updateParam("category", "")}
                className={`rounded-full border px-2.5 py-1 text-xs ${!category ? "border-civic-navy bg-civic-navy text-white" : "border-civic-line text-civic-mist"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam("category", c.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${category === c.id ? "border-civic-navy bg-civic-navy text-white" : "border-civic-line text-civic-mist"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label">Status</p>
            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input type="radio" name="status" checked={!status} onChange={() => updateParam("status", "")} />
                All statuses
              </label>
              {STATUSES.map((s) => (
                <label key={s.value} className="flex cursor-pointer items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="status"
                    checked={status === s.value}
                    onChange={() => updateParam("status", s.value)}
                  />
                  <StatusBadge status={s.value} />
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="label">Priority</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => updateParam("priority", "")}
                className={`rounded-full border px-2.5 py-1 text-xs ${!priority ? "border-civic-navy bg-civic-navy text-white" : "border-civic-line text-civic-mist"}`}
              >
                All
              </button>
              {PRIORITIES.map((p) => (
                <button key={p.value} onClick={() => updateParam("priority", p.value)}>
                  <PriorityBadge priority={p.value} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          {loading ? (
            <ReportGridSkeleton count={6} />
          ) : reports.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No reports match those filters"
              message="Try widening your search or clearing a filter."
            />
          ) : (
            <>
              <div className={view === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
                {reports.map((r) => (
                  <ReportCard key={r.id} report={r} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam("page", String(i + 1))}
                      className={`h-8 w-8 rounded-lg text-sm font-medium ${
                        page === i + 1 ? "bg-civic-navy text-white" : "border border-civic-line text-civic-mist"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

