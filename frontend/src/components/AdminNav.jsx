import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListChecks, Users, Tag } from "lucide-react";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/reports", label: "Reports", icon: ListChecks },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/categories", label: "Categories", icon: Tag },
];

export default function AdminNav() {
  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-civic-line bg-white p-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            `flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-civic-navy text-white" : "text-civic-mist hover:bg-civic-navy/5"
            }`
          }
        >
          <l.icon size={15} /> {l.label}
        </NavLink>
      ))}
    </nav>
  );
}
