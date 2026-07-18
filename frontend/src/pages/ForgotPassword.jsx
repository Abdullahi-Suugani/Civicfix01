import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import api from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card p-8">
        <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-civic-navy">
          <KeyRound size={20} /> Reset your password
        </div>
        {sent ? (
          <p className="text-sm text-civic-mist">
            If an account exists for <span className="font-semibold text-civic-ink">{email}</span>, we've sent a
            reset link. Check your inbox (and check the server console in this dev scaffold, since email sending
            is stubbed).
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-civic-mist">
          <Link to="/login" className="font-semibold text-civic-navy">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
