import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Locate, Upload, X, Send } from "lucide-react";
import api from "../api/client";
import ReportsMap from "../components/ReportsMap";
import { PRIORITIES } from "../constants";

const DEFAULT_CENTER = [2.0469, 45.3182]; // Mogadishu

export default function SubmitReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    priority: "MEDIUM",
    address: "",
    isAnonymous: false,
  });
  const [position, setPosition] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (!editId) return;
    api.get(`/reports/${editId}`).then(({ data }) => {
      const r = data.report;
      setForm({
        title: r.title,
        description: r.description,
        categoryId: r.categoryId,
        priority: r.priority,
        address: r.address || "",
        isAnonymous: r.isAnonymous,
      });
      setPosition({ lat: r.latitude, lng: r.longitude });
      setPreviews(r.images || []);
    });
  }, [editId]);

  function detectLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error("Couldn't get your location. Pin it on the map instead.")
    );
  }

  function handleFiles(e) {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!position) {
      toast.error("Pin the issue's location on the map first.");
      return;
    }
    if (!form.categoryId) {
      toast.error("Choose a category.");
      return;
    }
    setSubmitting(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      body.append("latitude", position.lat);
      body.append("longitude", position.lng);
      files.forEach((f) => body.append("images", f));

      if (editId) {
        await api.put(`/reports/${editId}`, body, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Report updated.");
        navigate(`/reports/${editId}`);
      } else {
        const { data } = await api.post("/reports", body, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Report submitted — thank you.");
        navigate(`/reports/${data.report.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't submit your report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-civic-ink">
        {editId ? "Edit report" : "Report an issue"}
      </h1>
      <p className="mt-1 text-sm text-civic-mist">
        The more detail you give, the faster the right department can act on it.
      </p>

      <form onSubmit={onSubmit} className="card mt-6 space-y-5 p-6">
        <div>
          <label className="label">Title</label>
          <input
            required
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Large pothole outside 12 Market St"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            required
            rows={4}
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What's the issue? Include any details that will help crews find and fix it."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select
              required
              className="input"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Upload images (up to 5)</label>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-civic-line px-4 py-8 text-center hover:border-civic-teal">
            <Upload size={20} className="text-civic-mist" />
            <span className="text-sm text-civic-mist">Click to choose photos, or drag them here</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </label>
          {previews.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label !mb-0">GPS location</label>
            <button type="button" onClick={detectLocation} className="btn-ghost !px-2 !py-1 text-xs">
              <Locate size={13} /> Use my current location
            </button>
          </div>
          <ReportsMap
            reports={[]}
            center={position ? [position.lat, position.lng] : DEFAULT_CENTER}
            zoom={14}
            height="280px"
            pickable
            onPick={(latlng) => setPosition(latlng)}
          />
          <p className="mt-2 text-xs text-civic-mist">
            {position
              ? `Pinned at ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
              : "Click anywhere on the map to drop a pin."}
          </p>
        </div>

        <div>
          <label className="label">Address (optional)</label>
          <input
            className="input"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Street name or nearest landmark"
          />
        </div>

        <div>
          <label className="label">Date</label>
          <input className="input bg-civic-paper" value={new Date().toLocaleDateString()} disabled />
        </div>

        <label className="flex items-center gap-2 text-sm text-civic-ink">
          <input
            type="checkbox"
            checked={form.isAnonymous}
            onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
          />
          Submit this report anonymously
        </label>

        <button className="btn-primary w-full" disabled={submitting}>
          <Send size={16} /> {submitting ? "Submitting…" : editId ? "Save changes" : "Submit report"}
        </button>
      </form>
    </div>
  );
}
