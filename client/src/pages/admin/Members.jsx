import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { memberService, exportService } from "../../services";
import { useLocationHierarchy } from "../../hooks/useLocationHierarchy.js";
import Spinner from "../../components/Spinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Modal from "../../components/Modal.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import MemberForm from "./partials/MemberForm.jsx";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const hierarchy = useLocationHierarchy();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (hierarchy.assemblyId) params.assemblyId = hierarchy.assemblyId;
    if (hierarchy.mandalId) params.mandalId = hierarchy.mandalId;
    if (hierarchy.panchayatId) params.panchayatId = hierarchy.panchayatId;
    memberService.list(params).then((res) => setMembers(res.data)).finally(() => setLoading(false));
  }, [search, hierarchy.assemblyId, hierarchy.mandalId, hierarchy.panchayatId]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    load();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await memberService.remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const exportParams = {
    ...(hierarchy.assemblyId ? { assemblyId: hierarchy.assemblyId } : {}),
    ...(hierarchy.mandalId ? { mandalId: hierarchy.mandalId } : {}),
    ...(hierarchy.panchayatId ? { panchayatId: hierarchy.panchayatId } : {}),
  };
  const downloadExcel = async () => {
  try {
    const res = await exportService.excel(exportParams);

    const url = window.URL.createObjectURL(
      new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "members.xlsx";
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Failed to export Excel.");
  }
};

const downloadPdf = async () => {
  try {
    const res = await exportService.pdf(exportParams);

    const url = window.URL.createObjectURL(
      new Blob([res.data], {
        type: "application/pdf",
      })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "members.pdf";
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Failed to export PDF.");
  }
};

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="text-gray-500 text-sm">Manage approved members of the foundation.</p>
        </div>
        <div className="flex gap-2">
          <button
  onClick={downloadExcel}
  className="btn-secondary text-sm"
>
  Export Excel
</button>

<button
  onClick={downloadPdf}
  className="btn-secondary text-sm"
>
  Export PDF
</button>
          <button onClick={openCreate} className="btn-primary text-sm">+ Add Member</button>
        </div>
      </div>

      <div className="card mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          className="input-field sm:col-span-1"
          placeholder="Search name, phone, member ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field" value={hierarchy.assemblyId} onChange={(e) => hierarchy.onAssemblyChange(e.target.value)}>
          <option value="">All Assemblies</option>
          {hierarchy.assemblies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select className="input-field" value={hierarchy.mandalId} onChange={(e) => hierarchy.onMandalChange(e.target.value)} disabled={!hierarchy.assemblyId}>
          <option value="">All Mandals</option>
          {hierarchy.mandals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select className="input-field" value={hierarchy.panchayatId} onChange={(e) => hierarchy.setPanchayatId(e.target.value)} disabled={!hierarchy.mandalId}>
          <option value="">All Panchayats</option>
          {hierarchy.panchayats.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Member ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Assembly</th>
                <th className="text-left px-4 py-3">Mandal</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-medium text-darkgray">{m.memberId}</td>
                  <td className="px-4 py-3">{m.fullName}</td>
                  <td className="px-4 py-3">{m.phone}</td>
                  <td className="px-4 py-3">{m.assembly?.name}</td>
                  <td className="px-4 py-3">{m.mandal?.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <Link to={`/admin/members/${m.id}/id-card`} className="text-saffron text-xs font-medium">ID Card</Link>
                    <button className="text-gray-500 text-xs font-medium" onClick={() => openEdit(m)}>Edit</button>
                    <button className="text-red-500 text-xs font-medium" onClick={() => setDeleteTarget(m)}>Delete</button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Member" : "Add Member"} widthClass="max-w-2xl">
        <MemberForm member={editing} onSaved={handleSaved} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        message={`Delete member "${deleteTarget?.fullName}"? This cannot be undone.`}
      />
    </div>
  );
}
