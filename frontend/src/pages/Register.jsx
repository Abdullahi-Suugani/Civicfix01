import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      toast.success("Account created. Welcome to CivicFix!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="card p-8">
        <div className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-civic-navy">
          <UserPlus size={20} /> Create your account
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              required
              className="input"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Amina Yusuf"
            />
          </div>
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
            <label className="label">Phone (optional)</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+252 6xx xxx xxx"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-civic-mist">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-civic-navy">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
