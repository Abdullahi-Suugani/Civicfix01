import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import api from "../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      toast.success("Password updated. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "That reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card p-8">
        <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-civic-navy">
          <ShieldCheck size={20} /> Set a new password
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Reset token</label>
            <input
              required
              className="input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste the token from your email"
            />
            <p className="mt-1 text-xs text-civic-mist">
              In this dev scaffold, the token is printed to the backend server console instead of emailed.
            </p>
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-civic-mist">
          <Link to="/login" className="font-semibold text-civic-navy">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
