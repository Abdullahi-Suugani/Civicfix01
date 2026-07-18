import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import api from "../api/client";
import AdminNav from "../components/AdminNav";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#2F6690");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  function load() {
    setLoading(true);
    api.get("/categories").then(({ data }) => setCategories(data.categories)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function addCategory(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post("/categories", { name: newName.trim(), color: newColor });
      setNewName("");
      toast.success("Category added.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't add category.");
    }
  }

  async function saveEdit(id) {
    try {
      await api.put(`/categories/${id}`, { name: editName });
      setEditingId(null);
      toast.success("Category updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update category.");
    }
  }

  async function removeCategory(id) {
    if (!confirm("Delete this category? Reports using it will need to be reassigned.")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete category — it may still have reports attached.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 font-display text-3xl font-bold text-civic-ink">Manage categories</h1>
      <p className="mb-6 text-sm text-civic-mist">Issue categories reports can be filed under.</p>
      <AdminNav />

      <form onSubmit={addCategory} className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="flex-1 min-w-[180px]">
          <label className="label">New category name</label>
          <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Noise Complaints" />
        </div>
        <div>
          <label className="label">Color</label>
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-10 w-14 rounded-lg border border-civic-line" />
        </div>
        <button className="btn-primary"><Plus size={15} /> Add</button>
      </form>

      <div className="card divide-y divide-civic-line">
        {loading ? (
          <p className="p-6 text-center text-civic-mist">Loading…</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 p-3">
              {editingId === c.id ? (
                <input className="input max-w-xs" value={editName} onChange={(e) => setEditName(e.target.value)} />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-medium text-civic-ink">{c.name}</span>
                  <span className="text-xs text-civic-mist">({c._count?.reports ?? 0} reports)</span>
                </div>
              )}
              <div className="flex gap-1">
                {editingId === c.id ? (
                  <>
                    <button onClick={() => saveEdit(c.id)} className="btn-ghost !p-1.5 text-civic-green"><Check size={15} /></button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost !p-1.5"><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingId(c.id); setEditName(c.name); }} className="btn-ghost !p-1.5"><Pencil size={14} /></button>
                    <button onClick={() => removeCategory(c.id)} className="btn-ghost !p-1.5 text-civic-red"><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
