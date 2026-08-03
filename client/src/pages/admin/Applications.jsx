import { useEffect, useState, useCallback } from "react";
import { applicationService } from "../../services";
import { fileUrl } from "../../services/api";
import Spinner from "../../components/Spinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Modal from "../../components/Modal.jsx";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");

  const [viewing, setViewing] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (search) params.search = search;
    applicationService.list(params).then((res) => setApplications(res.data)).finally(() => setLoading(false));
  }, [status, search]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (app) => {
    setBusyId(app.id);
    setError("");
    try {
      await applicationService.approve(app.id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve application");
    } finally {
      setBusyId(null);
    }
  };

  const submitReject = async () => {
    setBusyId(rejectTarget.id);
    try {
      await applicationService.reject(rejectTarget.id, rejectReason);
      setRejectTarget(null);
      setRejectReason("");
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Membership Applications</h1>
      <p className="text-gray-500 text-sm mb-6">Review, approve, or reject public membership applications.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="card mb-6 flex flex-col sm:flex-row gap-3">
        <select className="input-field sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input className="input-field" placeholder="Search by name or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Assembly</th>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium text-darkgray">{a.fullName}</td>
                  <td className="px-4 py-3">{a.phone}</td>
                  <td className="px-4 py-3">{a.assembly?.name}</td>
                  <td className="px-4 py-3">{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button className="text-gray-500 text-xs font-medium" onClick={() => setViewing(a)}>View</button>
                    {a.status === "PENDING" && (
                      <>
                        <button className="text-green-600 text-xs font-medium" disabled={busyId === a.id} onClick={() => approve(a)}>
                          Approve
                        </button>
                        <button className="text-red-500 text-xs font-medium" onClick={() => setRejectTarget(a)}>
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View details modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Application Details" widthClass="max-w-2xl">
        {viewing && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">Full Name:</span> {viewing.fullName}</div>
              <div><span className="text-gray-500">Father's Name:</span> {viewing.fatherName}</div>
              <div><span className="text-gray-500">DOB:</span> {new Date(viewing.dob).toLocaleDateString("en-IN")}</div>
              <div><span className="text-gray-500">Gender:</span> {viewing.gender}</div>
              <div><span className="text-gray-500">Phone:</span> {viewing.phone}</div>
              <div><span className="text-gray-500">Email:</span> {viewing.email || "-"}</div>
              <div><span className="text-gray-500">Aadhaar:</span> XXXX-XXXX-{viewing.aadhaarLast4}</div>
              <div><span className="text-gray-500">Status:</span> <StatusBadge status={viewing.status} /></div>
            </div>
            <div><span className="text-gray-500">Address:</span> {viewing.address}</div>
            <div><span className="text-gray-500">Location:</span> {viewing.district?.name} → {viewing.assembly?.name} → {viewing.mandal?.name} → {viewing.panchayat?.name}</div>
            <div className="flex gap-4 pt-2">
              {viewing.photoPath && (
                <a href={fileUrl(viewing.photoPath)} target="_blank" rel="noreferrer">
                  <img src={fileUrl(viewing.photoPath)} alt="Photo" className="w-24 h-28 object-cover rounded-lg border" />
                </a>
              )}
              {viewing.idProofPath && (
                <a href={fileUrl(viewing.idProofPath)} target="_blank" rel="noreferrer" className="text-saffron underline self-center">
                  View ID Proof
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject reason modal */}
      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject Application">
        <p className="text-sm text-gray-600 mb-3">Optionally provide a reason for rejecting {rejectTarget?.fullName}'s application.</p>
        <textarea className="input-field mb-4" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason (optional)" />
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setRejectTarget(null)}>Cancel</button>
          <button className="btn-danger" onClick={submitReject} disabled={busyId === rejectTarget?.id}>
            {busyId === rejectTarget?.id ? "Rejecting..." : "Reject Application"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
