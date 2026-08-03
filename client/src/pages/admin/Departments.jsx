import { useEffect, useState, useCallback } from "react";
import { departmentService, memberService } from "../../services";
import Modal from "../../components/Modal.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Spinner from "../../components/Spinner.jsx";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [assignOpen, setAssignOpen] = useState(null); // department being assigned to
  const [memberSearch, setMemberSearch] = useState("");
  const [memberOptions, setMemberOptions] = useState([]);
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    departmentService.list().then((res) => setDepartments(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!assignOpen || memberSearch.length < 2) {
      setMemberOptions([]);
      return;
    }
    const timeout = setTimeout(() => {
      memberService.list({ search: memberSearch }).then((res) => setMemberOptions(res.data));
    }, 300);
    return () => clearTimeout(timeout);
  }, [memberSearch, assignOpen]);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setError("");
    setFormOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setTitle(dept.title);
    setDescription(dept.description || "");
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editing) {
        await departmentService.update(editing.id, { title, description });
      } else {
        await departmentService.create({ title, description });
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save department");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await departmentService.remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const assignMember = async (member) => {
    setAssigning(true);
    try {
      await departmentService.assign(member.id, assignOpen.id);
      setMemberSearch("");
      setMemberOptions([]);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign");
    } finally {
      setAssigning(false);
    }
  };

  const unassign = async (assignmentId) => {
    await departmentService.unassign(assignmentId);
    load();
    if (assignOpen) {
      const updated = await departmentService.list();
      setDepartments(updated.data);
      const refreshed = updated.data.find((d) => d.id === assignOpen.id);
      setAssignOpen(refreshed || null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Official Departments</h1>
          <p className="text-gray-500 text-sm">Manage designations and assign them to members.</p>
        </div>
        <button className="btn-primary text-sm" onClick={openCreate}>+ Add Department</button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((d) => (
            <div key={d.id} className="card">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-darkgray">{d.title}</h3>
                <div className="space-x-2 text-xs">
                  <button className="text-gray-500" onClick={() => openEdit(d)}>Edit</button>
                  <button className="text-red-500" onClick={() => setDeleteTarget(d)}>Delete</button>
                </div>
              </div>
              {d.description && <p className="text-sm text-gray-500 mt-1">{d.description}</p>}
              <p className="text-xs text-gray-400 mt-3">{d.assignments?.length || 0} member(s) assigned</p>
              <div className="mt-2 space-y-1">
                {d.assignments?.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-md px-2 py-1">
                    <span>{a.member.fullName}</span>
                    <button className="text-red-400 text-xs" onClick={() => unassign(a.id)}>Remove</button>
                  </div>
                ))}
              </div>
              <button className="btn-secondary text-xs mt-3 w-full" onClick={() => setAssignOpen(d)}>
                Assign Member
              </button>
            </div>
          ))}
          {departments.length === 0 && <p className="text-gray-400 text-sm">No departments yet.</p>}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Department" : "Add Department"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
          <div>
            <label className="label">Title</label>
            <input required className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea className="input-field" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!assignOpen} onClose={() => { setAssignOpen(null); setMemberSearch(""); setMemberOptions([]); }} title={`Assign Member to ${assignOpen?.title}`}>
        <input
          className="input-field mb-3"
          placeholder="Search member by name, phone, or member ID"
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
        />
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {memberOptions.map((m) => (
            <button
              key={m.id}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm flex justify-between"
              onClick={() => assignMember(m)}
              disabled={assigning}
            >
              <span>{m.fullName} ({m.memberId})</span>
              <span className="text-gray-400">{m.phone}</span>
            </button>
          ))}
          {memberSearch.length >= 2 && memberOptions.length === 0 && (
            <p className="text-sm text-gray-400 px-1">No members found.</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        message={`Delete department "${deleteTarget?.title}"? All assignments will be removed.`}
      />
    </div>
  );
}
