import { useEffect, useState, useCallback } from "react";
import { locationService } from "../../services";
import Modal from "../../components/Modal.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Spinner from "../../components/Spinner.jsx";

const LEVELS = [
  { key: "state", label: "States", parent: null },
  { key: "district", label: "Districts", parent: "state", parentKey: "stateId", parentLabel: "State" },
  { key: "assembly", label: "Assemblies", parent: "district", parentKey: "districtId", parentLabel: "District" },
  { key: "mandal", label: "Mandals", parent: "assembly", parentKey: "assemblyId", parentLabel: "Assembly" },
  { key: "panchayat", label: "Village Panchayats", parent: "mandal", parentKey: "mandalId", parentLabel: "Mandal" },
];

function parentFieldOf(item, level) {
  // Each hierarchy item nests its immediate parent object; extract its id
  if (level.key === "district") return item.state?.id || item.stateId;
  if (level.key === "assembly") return item.district?.id || item.districtId;
  if (level.key === "mandal") return item.assembly?.id || item.assemblyId;
  if (level.key === "panchayat") return item.mandal?.id || item.mandalId;
  return null;
}

function parentNameOf(item, level) {
  if (level.key === "district") return item.state?.name;
  if (level.key === "assembly") return item.district?.name;
  if (level.key === "mandal") return item.assembly?.name;
  if (level.key === "panchayat") return item.mandal?.name;
  return null;
}

export default function OrganizationStructure() {
  const [activeLevel, setActiveLevel] = useState("state");
  const [items, setItems] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const level = LEVELS.find((l) => l.key === activeLevel);

  const load = useCallback(() => {
    setLoading(true);
    locationService.list(activeLevel).then((res) => setItems(res.data)).finally(() => setLoading(false));

    if (level.parent) {
      locationService.list(level.parent).then((res) => setParentOptions(res.data));
    }
  }, [activeLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setParentId("");
    setError("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name);
    setParentId(parentFieldOf(item, level) || "");
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (level.parent && !parentId) {
      setError(`Please select a ${level.parentLabel}`);
      return;
    }
    const data = { name };
    if (level.parentKey) data[level.parentKey] = parentId;

    setSaving(true);
    try {
      if (editing) {
        await locationService.update(activeLevel, editing.id, data);
      } else {
        await locationService.create(activeLevel, data);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await locationService.remove(activeLevel, deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteTarget(null);
      alert(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Organization Structure</h1>
      <p className="text-gray-500 text-sm mb-6">
        State → District → Assembly → Mandal (Circle) → Village Panchayat
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {LEVELS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActiveLevel(l.key)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              activeLevel === l.key ? "bg-saffron text-white border-saffron" : "border-gray-300 text-gray-600"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <button className="btn-primary text-sm" onClick={openCreate}>+ Add {level.label.slice(0, -1)}</button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                {level.parent && <th className="text-left px-4 py-3">{level.parentLabel}</th>}
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-darkgray">{item.name}</td>
                  {level.parent && <td className="px-4 py-3">{parentNameOf(item, level)}</td>}
                  <td className="px-4 py-3 text-right space-x-2">
                    <button className="text-gray-500 text-xs font-medium" onClick={() => openEdit(item)}>Edit</button>
                    <button className="text-red-500 text-xs font-medium" onClick={() => setDeleteTarget(item)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={level.parent ? 3 : 2} className="px-4 py-8 text-center text-gray-400">
                    No {level.label.toLowerCase()} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? `Edit ${level.label.slice(0, -1)}` : `Add ${level.label.slice(0, -1)}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
          {level.parent && (
            <div>
              <label className="label">{level.parentLabel}</label>
              <select className="input-field" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">Select {level.parentLabel}</option>
                {parentOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Name</label>
            <input required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
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
        message={`Delete "${deleteTarget?.name}"? Entries beneath it must be removed first.`}
      />
    </div>
  );
}
