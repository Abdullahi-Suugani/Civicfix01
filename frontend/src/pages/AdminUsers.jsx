import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Trash2 } from "lucide-react";
import api from "../api/client";
import AdminNav from "../components/AdminNav";
import { format } from "date-fns";

const ROLES = ["CITIZEN", "MODERATOR", "ADMIN"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api
      .get("/users", { params: { search, page, limit: 15 } })
      .then(({ data }) => {
        setUsers(data.users);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function changeRole(id, role) {
    try {
      await api.put(`/users/${id}`, { role });
      toast.success("Role updated.");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update role.");
    }
  }

  async function removeUser(id) {
    if (!confirm("Delete this user? Their reports will remain but be unassigned.")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted.");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete this user.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 font-display text-3xl font-bold text-civic-ink">Manage users</h1>
      <p className="mb-6 text-sm text-civic-mist">{pagination.total} accounts registered.</p>
      <AdminNav />

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-civic-mist" />
        <input
          className="input pl-8"
          placeholder="Search by name or email…"
          onKeyDown={(e) => e.key === "Enter" && (setSearch(e.currentTarget.value), setPage(1))}
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-civic-line text-xs uppercase tracking-wide text-civic-mist">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Reports filed</th>
              <th className="p-3">Role</th>
              <th className="p-3">Joined</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-civic-line">
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-civic-mist">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-civic-mist">No users match your search.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3 font-medium text-civic-ink">{u.fullName}</td>
                  <td className="p-3 text-civic-mist">{u.email}</td>
                  <td className="p-3 text-civic-mist">{u._count?.reports ?? 0}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="rounded-md border border-civic-line bg-white px-2 py-1 text-xs"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="p-3 font-mono text-xs text-civic-mist">{format(new Date(u.createdAt), "MMM d, yyyy")}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => removeUser(u.id)} className="btn-ghost !p-1.5 text-civic-red"><Trash2 size={14} /></button>
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
