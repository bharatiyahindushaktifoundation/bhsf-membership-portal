import { useEffect, useState, useCallback } from "react";
import { adminManagementService } from "../../services";
import { useAuth } from "../../hooks/useAuth.js";
import Spinner from "../../components/Spinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";

export default function AdminManagement() {
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    adminManagementService
      .list(params)
      .then((res) => setAdmins(res.data))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (id, action) => {
    setBusyId(id);
    setError("");
    try {
      await action(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await adminManagementService.remove(removeTarget.id);
      setRemoveTarget(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove admin");
      setRemoveTarget(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Admin Management</h1>
      <p className="text-gray-500 text-sm mb-6">
        Manage who has dashboard access. Designation holders become Admins automatically; only a
        Super Admin can promote, demote, or remove accounts here.
      </p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="card mb-6">
        <input
          className="input-field"
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                <th className="text-left px-4 py-3">Designation</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((a) => {
                const isSelf = a.id === currentAdmin?.id;
                const busy = busyId === a.id;
                return (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-medium text-darkgray">
                      {a.name} {isSelf && <span className="text-xs text-gray-400">(you)</span>}
                    </td>
                    <td className="px-4 py-3">{a.phone}</td>
                    <td className="px-4 py-3">{a.designations.length ? a.designations.join(", ") : "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          a.role === "SUPER_ADMIN" ? "bg-saffron-100 text-saffron-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {a.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.isActive ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      {a.isActive ? (
                        <button
                          className="text-yellow-600 text-xs font-medium disabled:opacity-40"
                          disabled={isSelf || busy}
                          onClick={() => runAction(a.id, adminManagementService.deactivate)}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="text-green-600 text-xs font-medium disabled:opacity-40"
                          disabled={isSelf || busy}
                          onClick={() => runAction(a.id, adminManagementService.activate)}
                        >
                          Activate
                        </button>
                      )}
                      {a.role === "SUPER_ADMIN" ? (
                        <button
                          className="text-gray-500 text-xs font-medium disabled:opacity-40"
                          disabled={isSelf || busy}
                          onClick={() => runAction(a.id, adminManagementService.demote)}
                        >
                          Demote
                        </button>
                      ) : (
                        <button
                          className="text-saffron text-xs font-medium disabled:opacity-40"
                          disabled={busy}
                          onClick={() => runAction(a.id, adminManagementService.promote)}
                        >
                          Promote
                        </button>
                      )}
                      <button
                        className="text-red-500 text-xs font-medium disabled:opacity-40"
                        disabled={isSelf || busy}
                        onClick={() => setRemoveTarget(a)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No admins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={confirmRemove}
        loading={removing}
        message={`Remove dashboard access for "${removeTarget?.name}"? This does not delete their member record or designations.`}
      />
    </div>
  );
}
