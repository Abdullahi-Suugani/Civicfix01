import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Search, ArrowRight, Camera, Users, CheckCircle2,
  Construction, Lightbulb, Trash2, Droplets, ShieldAlert, Trees,
} from "lucide-react";
import api from "../api/client";
import ReportCard from "../components/ReportCard";
import ReportsMap from "../components/ReportsMap";
import { ReportGridSkeleton } from "../components/Skeletons";

const CATEGORY_ICONS = {
  Roads: Construction,
  "Street Lights": Lightbulb,
  "Garbage Collection": Trash2,
  "Water Supply": Droplets,
  "Public Safety": ShieldAlert,
  Parks: Trees,
};

const FAQS = [
  {
    q: "Who can see my report?",
    a: "Reports are public by default so neighbors can track progress together, but you can submit anonymously if you'd rather your name not be attached.",
  },
  {
    q: "How fast will something be fixed?",
    a: "It depends on the category and priority. Each report has a status you can follow — pending, under review, in progress, resolved — updated by the assigned department.",
  },
  {
    q: "What if my issue is an emergency?",
    a: "CivicFix is for non-emergency infrastructure issues. For anything life-threatening, contact emergency services directly first.",
  },
  {
    q: "Can I edit a report after submitting it?",
    a: "Yes, as long as it's still marked Pending. Once a department starts reviewing it, edits are locked to keep the record accurate.",
  },
];

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/reports", { params: { limit: 6, sort: "newest" } }),
      api.get("/categories"),
    ])
      .then(([reportsRes, categoriesRes]) => {
        setFeatured(reportsRes.data.reports);
        setCategories(categoriesRes.data.categories);
        const total = reportsRes.data.pagination.total;
        const resolved = reportsRes.data.reports.filter((r) => r.status === "RESOLVED").length;
        setStats({ total, categories: categoriesRes.data.categories.length });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-civic-line bg-civic-navy">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-xs uppercase tracking-wide text-white/80">
              Filed like a permit, tracked like a package
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
              See a problem on your street? File it in two minutes.
            </h1>
            <p className="mt-5 text-lg text-white/70">
              CivicFix turns scattered phone calls and social posts into one shared record between
              citizens and city hall — with photos, a pin on the map, and a status you can actually track.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/submit-report" className="btn-accent">
                <Camera size={16} /> Report an issue
              </Link>
              <Link to="/map" className="btn border border-white/30 text-white hover:bg-white/10">
                <MapPin size={16} /> View the live map
              </Link>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/reports?search=${encodeURIComponent(search)}`;
              }}
              className="mt-8 flex max-w-md items-center gap-2 rounded-xl bg-white p-1.5 shadow-card"
            >
              <Search size={18} className="ml-2 shrink-0 text-civic-mist" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports by keyword, road, or area…"
                className="w-full bg-transparent py-2 text-sm text-civic-ink outline-none placeholder:text-civic-mist"
              />
              <button className="btn-primary shrink-0">Search</button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-civic-line bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[
            { label: "Reports filed", value: stats?.total ?? "—" },
            { label: "Issue categories", value: stats?.categories ?? "—" },
            { label: "Departments connected", value: 6 },
            { label: "Avg. time to review", value: "48h" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-mono text-3xl font-semibold text-civic-navy">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-civic-mist">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-civic-ink">What can you report?</h2>
            <p className="mt-1 text-sm text-civic-mist">Thirteen categories, routed straight to the right department.</p>
          </div>
          <Link to="/reports" className="hidden items-center gap-1 text-sm font-semibold text-civic-navy sm:inline-flex">
            Browse all reports <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.slice(0, 6).map((c) => {
            const Icon = CATEGORY_ICONS[c.name] || MapPin;
            return (
              <Link
                key={c.id}
                to={`/reports?category=${c.id}`}
                className="card flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-0.5"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${c.color}1A`, color: c.color }}
                >
                  <Icon size={18} />
                </span>
                <span className="text-xs font-medium text-civic-ink">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured reports */}
      <section className="border-y border-civic-line bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-civic-ink">Recently filed</h2>
              <p className="mt-1 text-sm text-civic-mist">Fresh off the record — see what neighbors are reporting.</p>
            </div>
            <Link to="/reports" className="hidden items-center gap-1 text-sm font-semibold text-civic-navy sm:inline-flex">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <ReportGridSkeleton count={3} />
          ) : featured.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 3).map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-civic-mist">No reports yet — be the first to file one.</p>
          )}
        </div>
      </section>

      {/* Map preview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-civic-ink">Every report, on the map</h2>
          <p className="mt-1 text-sm text-civic-mist">Red is pending, amber is in progress, green is resolved.</p>
        </div>
        <ReportsMap reports={featured} height="380px" />
      </section>

      {/* CTA */}
      <section className="bg-civic-navy py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Users size={28} className="mx-auto mb-4 text-white/70" />
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Your neighborhood works better when everyone's watching the same list.
          </h2>
          <div className="mt-6">
            <Link to="/register" className="btn-accent">
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 font-display text-2xl font-bold text-civic-ink">From the neighborhood</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { name: "Hodan A.", quote: "I filed a streetlight report and actually watched it move to \"in progress\" three days later. That never happened when I just called." },
            { name: "Farah M.", quote: "The map view is what sold me — I can see every pothole on my commute and whether it's already been reported." },
            { name: "Deqa I.", quote: "As someone who used to chase the water department by phone, having a status I can check any time is a huge relief." },
          ].map((t) => (
            <div key={t.name} className="card p-5">
              <CheckCircle2 size={18} className="mb-3 text-civic-green" />
              <p className="text-sm text-civic-ink">"{t.quote}"</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-civic-mist">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-civic-line bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-8 font-display text-2xl font-bold text-civic-ink">Frequently asked questions</h2>
          <div className="divide-y divide-civic-line">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-civic-ink">
                  {f.q}
                  <span className="text-civic-mist transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm text-civic-mist">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
