import { useEffect, useState, useCallback } from "react";
import { newsService } from "../../services";
import { fileUrl } from "../../services/api";
import Modal from "../../components/Modal.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Spinner from "../../components/Spinner.jsx";

const emptyForm = { title: "", description: "", date: "" };

export default function NewsAdmin() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    newsService.list().then((res) => setNews(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, date: new Date().toISOString().substring(0, 10) });
    setImage(null);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (n) => {
    setEditing(n);
    setForm({ title: n.title, description: n.description, date: n.date.substring(0, 10) });
    setImage(null);
    setError("");
    setFormOpen(true);
  };

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (image) data.append("image", image);

    setSaving(true);
    try {
      if (editing) {
        await newsService.update(editing.id, data);
      } else {
        await newsService.create(data);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save news item");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await newsService.remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">News</h1>
          <p className="text-gray-500 text-sm">Publish updates and announcements shown on the homepage.</p>
        </div>
        <button className="btn-primary text-sm" onClick={openCreate}>+ Add News</button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map((n) => (
            <div key={n.id} className="card">
              {n.imagePath && <img src={fileUrl(n.imagePath)} alt={n.title} className="w-full h-36 object-cover rounded-lg mb-3" />}
              <p className="text-xs text-gray-400">{new Date(n.date).toLocaleDateString("en-IN")}</p>
              <h3 className="font-semibold text-darkgray mt-1">{n.title}</h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{n.description}</p>
              <div className="flex justify-end gap-2 mt-3 text-xs">
                <button className="text-gray-500" onClick={() => openEdit(n)}>Edit</button>
                <button className="text-red-500" onClick={() => setDeleteTarget(n)}>Delete</button>
              </div>
            </div>
          ))}
          {news.length === 0 && <p className="text-gray-400 text-sm">No news yet.</p>}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit News" : "Add News"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
          <div>
            <label className="label">Title</label>
            <input required className="input-field" value={form.title} onChange={update("title")} />
          </div>
          <div>
            <label className="label">Date</label>
            <input required type="date" className="input-field" value={form.date} onChange={update("date")} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea required rows={3} className="input-field" value={form.description} onChange={update("description")} />
          </div>
          <div>
            <label className="label">Image {editing && "(leave blank to keep existing)"}</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="input-field" onChange={(e) => setImage(e.target.files[0])} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        message={`Delete news item "${deleteTarget?.title}"?`}
      />
    </div>
  );
}
