import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Bookmark, Activity, BarChart3, UserCog, Settings as SettingsIcon } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import ReportCard from "../components/ReportCard";
import { ReportGridSkeleton, StatCardSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { format } from "date-fns";

const TABS = [
  { key: "reports", label: "My Reports", icon: FileText },
  { key: "saved", label: "Saved Reports", icon: Bookmark },
  { key: "activity", label: "Activity Timeline", icon: Activity },
  { key: "stats", label: "Statistics", icon: BarChart3 },
  { key: "profile", label: "Profile", icon: UserCog },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function CitizenDashboard() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState("reports");
  const [myReports, setMyReports] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.get("/reports", { params: { userId: user.id, limit: 50 } }),
      api.get("/reports/mine/saved"),
    ])
      .then(([mine, savedRes]) => {
        setMyReports(mine.data.reports);
        setSaved(savedRes.data.reports);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const stats = {
    total: myReports.length,
    pending: myReports.filter((r) => r.status === "PENDING").length,
    inProgress: myReports.filter((r) => r.status === "IN_PROGRESS" || r.status === "UNDER_REVIEW").length,
    resolved: myReports.filter((r) => r.status === "RESOLVED").length,
  };

  const activity = [...myReports]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-civic-ink">Welcome back, {user?.fullName?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-civic-mist">Here's everything you've filed with CivicFix.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                tab === t.key ? "bg-civic-navy text-white" : "text-civic-mist hover:bg-civic-navy/5"
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "reports" && (
            loading ? <ReportGridSkeleton /> : myReports.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {myReports.map((r) => <ReportCard key={r.id} report={r} />)}
              </div>
            ) : (
              <EmptyState icon={FileText} title="No reports yet" message="File your first report to see it here." action={<Link to="/submit-report" className="btn-primary">Report an issue</Link>} />
            )
          )}

          {tab === "saved" && (
            loading ? <ReportGridSkeleton /> : saved.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {saved.map((r) => <ReportCard key={r.id} report={r} />)}
              </div>
            ) : (
              <EmptyState icon={Bookmark} title="No saved reports" message="Bookmark reports you want to keep an eye on." />
            )
          )}

          {tab === "activity" && (
            <div className="card divide-y divide-civic-line">
              {activity.length === 0 && <div className="p-6"><EmptyState icon={Activity} title="No activity yet" /></div>}
              {activity.map((r) => (
                <Link key={r.id} to={`/reports/${r.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-civic-navy/5">
                  <div>
                    <p className="text-sm font-medium text-civic-ink">{r.title}</p>
                    <p className="font-mono text-xs text-civic-mist">Updated {format(new Date(r.updatedAt), "MMM d, yyyy · h:mm a")}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}

          {tab === "stats" && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {loading ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
                [
                  { label: "Total filed", value: stats.total },
                  { label: "Pending", value: stats.pending },
                  { label: "In progress", value: stats.inProgress },
                  { label: "Resolved", value: stats.resolved },
                ].map((s) => (
                  <div key={s.label} className="card p-5">
                    <p className="text-xs uppercase tracking-wide text-civic-mist">{s.label}</p>
                    <p className="mt-2 font-mono text-3xl font-semibold text-civic-navy">{s.value}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "profile" && <ProfileForm user={user} updateUser={updateUser} />}
          {tab === "settings" && <SettingsForm />}
        </div>
      </div>
    </div>
  );
}

function ProfileForm({ user, updateUser }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/users/${user.id}`, form);
      updateUser(data.user);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-lg space-y-4 p-6">
      <div>
        <label className="label">Full name</label>
        <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input bg-civic-paper" value={user?.email} disabled />
      </div>
      <div>
        <label className="label">Phone</label>
        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label className="label">Address</label>
        <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

function SettingsForm() {
  const [password, setPassword] = useState("");
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setSaving(true);
    try {
      await api.put(`/users/${user.id}`, { password });
      setPassword("");
      toast.success("Password updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-civic-mist">Change password</h3>
        <input
          type="password"
          className="input"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn-primary" disabled={saving}>{saving ? "Updating…" : "Update password"}</button>
      </form>
    </div>
  );
}
