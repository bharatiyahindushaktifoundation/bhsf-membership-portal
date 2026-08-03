import { useEffect, useState, useCallback } from "react";
import { activityService } from "../../services";
import { fileUrl } from "../../services/api";
import Modal from "../../components/Modal.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Spinner from "../../components/Spinner.jsx";

const emptyForm = { title: "", description: "", category: activityService.categories[0], date: "", report: "" };

export default function ActivitiesAdmin() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    activityService.list().then((res) => setActivities(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description,
      category: a.category,
      date: a.date.substring(0, 10),
      report: a.report || "",
    });
    setImages([]);
    setError("");
    setFormOpen(true);
  };

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    images.forEach((img) => data.append("images", img));

    setSaving(true);
    try {
      if (editing) {
        await activityService.update(editing.id, data);
      } else {
        await activityService.create(data);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save activity");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await activityService.remove(deleteTarget.id);
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
          <h1 className="page-title">Activities</h1>
          <p className="text-gray-500 text-sm">Manage community activities and events.</p>
        </div>
        <button className="btn-primary text-sm" onClick={openCreate}>+ Add Activity</button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((a) => (
            <div key={a.id} className="card">
              {a.images?.[0] && (
                <img src={fileUrl(a.images[0].imagePath)} alt={a.title} className="w-full h-36 object-cover rounded-lg mb-3" />
              )}
              <span className="text-xs font-medium text-saffron">{a.category}</span>
              <h3 className="font-semibold text-darkgray mt-1">{a.title}</h3>
              <p className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString("en-IN")}</p>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{a.description}</p>
              <div className="flex justify-end gap-2 mt-3 text-xs">
                <button className="text-gray-500" onClick={() => openEdit(a)}>Edit</button>
                <button className="text-red-500" onClick={() => setDeleteTarget(a)}>Delete</button>
              </div>
            </div>
          ))}
          {activities.length === 0 && <p className="text-gray-400 text-sm">No activities yet.</p>}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Activity" : "Add Activity"} widthClass="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
          <div>
            <label className="label">Title</label>
            <input required className="input-field" value={form.title} onChange={update("title")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={update("category")}>
                {activityService.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input required type="date" className="input-field" value={form.date} onChange={update("date")} />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea required rows={3} className="input-field" value={form.description} onChange={update("description")} />
          </div>
          <div>
            <label className="label">Report (optional)</label>
            <textarea rows={2} className="input-field" value={form.report} onChange={update("report")} />
          </div>
          <div>
            <label className="label">Images {editing && "(adds to existing images)"}</label>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="input-field" onChange={(e) => setImages(Array.from(e.target.files))} />
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
        message={`Delete activity "${deleteTarget?.title}"?`}
      />
    </div>
  );
}
