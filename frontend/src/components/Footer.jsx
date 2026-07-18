import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-civic-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-civic-navy">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-civic-navy text-white">
                <MapPin size={18} />
              </span>
              CivicFix
            </div>
            <p className="mt-3 text-sm text-civic-mist">
              A shared record between neighbors and city hall — report it, track it, get it fixed.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-civic-mist">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/reports" className="hover:text-civic-navy">Browse reports</Link></li>
              <li><Link to="/map" className="hover:text-civic-navy">Live map</Link></li>
              <li><Link to="/submit-report" className="hover:text-civic-navy">Submit a report</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-civic-mist">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-civic-navy">Log in</Link></li>
              <li><Link to="/register" className="hover:text-civic-navy">Register</Link></li>
              <li><Link to="/admin" className="hover:text-civic-navy">Admin console</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-civic-mist">Support</h4>
            <ul className="space-y-2 text-sm text-civic-mist">
              <li>help@civicfix.gov</li>
              <li>Mon–Fri, 8am–5pm</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-civic-line pt-6 text-xs text-civic-mist">
          © {new Date().getFullYear()} CivicFix. Built for community demonstration purposes.
        </div>
      </div>
    </footer>
  );
}
