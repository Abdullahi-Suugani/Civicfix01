import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.fullName.split(" ")[0]}.`);
      navigate(location.state?.from || "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card p-8">
        <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-civic-navy">
          <LogIn size={20} /> Log in to CivicFix
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-civic-teal">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-civic-mist">
          New to CivicFix?{" "}
          <Link to="/register" className="font-semibold text-civic-navy">
            Create an account
          </Link>
        </p>
        <div className="mt-4 rounded-lg bg-civic-navy/5 p-3 text-xs text-civic-mist">
          Demo logins — Admin: admin@civicfix.gov / Admin123! · Citizen: citizen@example.com / Citizen123!
        </div>
      </div>
    </div>
  );
}
