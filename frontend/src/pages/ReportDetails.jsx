import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, Calendar, User, Building2, Bookmark, Trash2, Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import ReportsMap from "../components/ReportsMap";

export default function ReportDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  function load() {
    setLoading(true);
    api
      .get(`/reports/${id}`)
      .then(({ data }) => setReport(data.report))
      .catch(() => toast.error("That report couldn't be found."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function postComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await api.post("/comments", { reportId: id, comment: commentText.trim() });
      setCommentText("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't post your comment.");
    } finally {
      setPosting(false);
    }
  }

  async function deleteReport() {
    if (!confirm("Delete this report? This can't be undone.")) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.success("Report deleted.");
      navigate("/reports");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete this report.");
    }
  }

  async function toggleSave() {
    try {
      const { data } = await api.post(`/reports/${id}/save`);
      toast.success(data.saved ? "Saved to your favorites." : "Removed from favorites.");
    } catch {
      toast.error("Log in to save reports.");
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-civic-mist">Loading report…</div>;
  }
  if (!report) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-civic-mist">Report not found.</p>
        <Link to="/reports" className="btn-outline mt-4 inline-flex">
          Back to reports
        </Link>
      </div>
    );
  }

  const canManage = user && (user.id === report.userId || ["ADMIN", "MODERATOR"].includes(user.role));
  const canDelete = user && (user.id === report.userId || ["ADMIN", "MODERATOR"].includes(user.role));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/reports" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-civic-mist hover:text-civic-ink">
        <ArrowLeft size={15} /> Back to reports
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Images */}
          {report.images?.length > 0 ? (
            <div className="card overflow-hidden">
              <img src={report.images[activeImage]} alt="" className="h-80 w-full object-cover" />
              {report.images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {report.images.map((img, i) => (
                    <button
                      key={img}
                      onClick={() => setActiveImage(i)}
                      className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                        i === activeImage ? "border-civic-navy" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card flex h-52 items-center justify-center font-mono text-sm text-civic-mist">
              No photos attached to this report
            </div>
          )}

          {/* Title + meta */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} size="lg" />
              <PriorityBadge priority={report.priority} />
              <span
                className="rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: `${report.category?.color}1A`, color: report.category?.color }}
              >
                {report.category?.name}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-civic-ink sm:text-3xl">{report.title}</h1>
            <p className="mt-3 whitespace-pre-line text-civic-ink/90">{report.description}</p>
          </div>

          {/* Map */}
          <div>
            <h2 className="mb-2 flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wide text-civic-mist">
              <MapPin size={14} /> Location
            </h2>
            <ReportsMap reports={[report]} center={[report.latitude, report.longitude]} zoom={16} height="280px" />
            {report.address && <p className="mt-2 text-sm text-civic-mist">{report.address}</p>}
          </div>

          {/* Timeline */}
          {report.timelineEvents?.length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-civic-mist">Timeline</h2>
              <ol className="space-y-4 border-l-2 border-civic-line pl-4">
                {report.timelineEvents.map((ev) => (
                  <li key={ev.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-civic-navy" />
                    <StatusBadge status={ev.status} />
                    {ev.note && <p className="mt-1 text-sm text-civic-ink/80">{ev.note}</p>}
                    <p className="font-mono text-[11px] text-civic-mist">{format(new Date(ev.createdAt), "MMM d, yyyy · h:mm a")}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Comments */}
          <div>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-civic-mist">
              Comments ({report.comments?.length ?? 0})
            </h2>
            <div className="space-y-4">
              {report.comments?.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-civic-navy/10 text-xs font-semibold text-civic-navy">
                    {c.user?.fullName?.[0] ?? "?"}
                  </span>
                  <div className="card flex-1 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-civic-ink">{c.user?.fullName}</span>
                      <span className="font-mono text-[11px] text-civic-mist">{format(new Date(c.createdAt), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="mt-1 text-sm text-civic-ink/90">{c.comment}</p>
                  </div>
                </div>
              ))}
              {!report.comments?.length && <p className="text-sm text-civic-mist">No comments yet.</p>}
            </div>

            {user ? (
              <form onSubmit={postComment} className="mt-4 flex gap-2">
                <input
                  className="input"
                  placeholder="Add a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button className="btn-primary shrink-0" disabled={posting}>
                  <Send size={15} />
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-civic-mist">
                <Link to="/login" className="font-semibold text-civic-navy">Log in</Link> to leave a comment.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-civic-mist" />
              <span className="text-civic-ink">{report.isAnonymous ? "Anonymous reporter" : report.user?.fullName || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-civic-mist" />
              <span className="text-civic-ink">{format(new Date(report.createdAt), "MMM d, yyyy")}</span>
            </div>
            {report.department && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={14} className="text-civic-mist" />
                <span className="text-civic-ink">{report.department.departmentName}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {user && (
              <button onClick={toggleSave} className="btn-outline w-full">
                <Bookmark size={15} /> Save report
              </button>
            )}
            {canManage && report.status === "PENDING" && (
              <Link to={`/submit-report?edit=${report.id}`} className="btn-outline w-full">
                Edit report
              </Link>
            )}
            {canDelete && (
              <button onClick={deleteReport} className="btn w-full border border-civic-red text-civic-red hover:bg-civic-red/5">
                <Trash2 size={15} /> Delete report
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
