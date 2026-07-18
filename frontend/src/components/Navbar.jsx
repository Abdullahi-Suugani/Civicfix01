import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Bell, MapPin, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/reports", label: "Reports" },
  { to: "/map", label: "Map" },
  { to: "/submit-report", label: "Report an Issue" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-civic-line bg-civic-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-civic-navy">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-civic-navy text-white">
            <MapPin size={18} />
          </span>
          CivicFix
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-civic-navy" : "text-civic-mist hover:text-civic-ink"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/notifications" className="btn-ghost !px-2">
                <Bell size={18} />
              </Link>
              <Link
                to={user.role === "ADMIN" || user.role === "MODERATOR" ? "/admin" : "/dashboard"}
                className="btn-outline"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="btn-ghost"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Report an issue
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-civic-line bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium text-civic-ink">
                {l.label}
              </NavLink>
            ))}
            <hr className="border-civic-line" />
            {user ? (
              <>
                <Link to="/notifications" onClick={() => setOpen(false)} className="text-sm font-medium">
                  Notifications
                </Link>
                <Link
                  to={user.role === "ADMIN" || user.role === "MODERATOR" ? "/admin" : "/dashboard"}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="text-left text-sm font-medium text-civic-red"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-sm font-semibold text-civic-navy">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
