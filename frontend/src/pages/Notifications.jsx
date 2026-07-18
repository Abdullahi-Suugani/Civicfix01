import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../api/client";
import EmptyState from "../components/EmptyState";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get("/notifications").then(({ data }) => setNotifications(data.notifications)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function markAllRead() {
    await api.put("/notifications/read-all");
    load();
  }

  async function markRead(id) {
    await api.put(`/notifications/${id}/read`);
    load();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-civic-ink">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={markAllRead} className="btn-ghost text-sm">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" message="We'll let you know when there's an update on your reports." />
      ) : (
        <div className="card divide-y divide-civic-line">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`flex w-full items-start gap-3 p-4 text-left ${!n.isRead ? "bg-civic-teal/5" : ""}`}
            >
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? "bg-civic-teal" : "bg-transparent"}`} />
              <div>
                <p className="text-sm font-semibold text-civic-ink">{n.title}</p>
                <p className="text-sm text-civic-mist">{n.message}</p>
                <p className="mt-1 font-mono text-[11px] text-civic-mist">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
