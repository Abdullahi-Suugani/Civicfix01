import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Clock, CheckCircle2, Users2, Tags, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import api from "../api/client";
import AdminNav from "../components/AdminNav";
import { StatCardSkeleton } from "../components/Skeletons";
import StatusBadge from "../components/StatusBadge";
import { format } from "date-fns";

const PIE_COLORS = ["#16324A", "#2F6690", "#0E7C7B", "#2F9E44", "#E8A33D", "#D64545", "#6B7686"];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/statistics").then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  const cards = data
    ? [
        { label: "Total Reports", value: data.cards.totalReports, icon: FileText },
        { label: "Pending Reports", value: data.cards.pendingReports, icon: Clock },
        { label: "Resolved Reports", value: data.cards.resolvedReports, icon: CheckCircle2 },
        { label: "Active Users", value: data.cards.activeUsers, icon: Users2 },
        { label: "Categories", value: data.cards.totalCategories, icon: Tags },
        { label: "New Today", value: data.cards.newReportsToday, icon: TrendingUp },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 font-display text-3xl font-bold text-civic-ink">Admin overview</h1>
      <p className="mb-6 text-sm text-civic-mist">A city-wide view of everything moving through CivicFix.</p>
      <AdminNav />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : cards.map((c) => (
              <div key={c.label} className="card p-4">
                <c.icon size={16} className="text-civic-teal" />
                <p className="mt-2 font-mono text-2xl font-semibold text-civic-navy">{c.value}</p>
                <p className="text-[11px] uppercase tracking-wide text-civic-mist">{c.label}</p>
              </div>
            ))}
      </div>

      {!loading && data && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-civic-mist">
                Reports by month
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.charts.reportsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E4E8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#16324A" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-civic-mist">
                Reports by category
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.charts.reportsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E4E8" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0E7C7B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-civic-mist">
                Reports by status
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.charts.reportsByStatus} dataKey="count" nameKey="status" outerRadius={85} label>
                    {data.charts.reportsByStatus.map((entry, i) => (
                      <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card flex flex-col items-center justify-center p-5 text-center">
              <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-civic-mist">
                Resolution rate
              </h3>
              <div className="font-mono text-5xl font-bold text-civic-green">{data.charts.resolutionRate}%</div>
              <p className="mt-2 text-xs text-civic-mist">of all reports have been marked resolved</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="card">
              <h3 className="border-b border-civic-line p-4 font-display text-sm font-semibold uppercase tracking-wide text-civic-mist">
                Recent reports
              </h3>
              <div className="divide-y divide-civic-line">
                {data.tables.recentReports.map((r) => (
                  <Link key={r.id} to={`/reports/${r.id}`} className="flex items-center justify-between gap-3 p-3 hover:bg-civic-navy/5">
                    <div>
                      <p className="text-sm font-medium text-civic-ink line-clamp-1">{r.title}</p>
                      <p className="text-xs text-civic-mist">{r.category?.name} · {r.user?.fullName || "Anonymous"}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="border-b border-civic-line p-4 font-display text-sm font-semibold uppercase tracking-wide text-civic-mist">
                Recent users
              </h3>
              <div className="divide-y divide-civic-line">
                {data.tables.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-3 p-3">
                    <div>
                      <p className="text-sm font-medium text-civic-ink">{u.fullName}</p>
                      <p className="text-xs text-civic-mist">{u.email}</p>
                    </div>
                    <span className="rounded-full bg-civic-navy/5 px-2 py-0.5 text-[11px] font-medium text-civic-navy">{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
