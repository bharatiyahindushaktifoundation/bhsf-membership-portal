import { useState } from "react";
import { memberService } from "../../../services";
import { useLocationHierarchy } from "../../../hooks/useLocationHierarchy.js";

export default function MemberForm({ member, onSaved, onCancel }) {
  const isEdit = !!member;
  const hierarchy = useLocationHierarchy(
    isEdit
      ? { assemblyId: member.assemblyId, mandalId: member.mandalId, panchayatId: member.panchayatId }
      : {}
  );

  const [form, setForm] = useState({
    fullName: member?.fullName || "",
    fatherName: member?.fatherName || "",
    dob: member?.dob ? member.dob.substring(0, 10) : "",
    gender: member?.gender || "MALE",
    address: member?.address || "",
    phone: member?.phone || "",
    email: member?.email || "",
    aadhaarLast4: member?.aadhaarLast4 || "",
    status: member?.status || "ACTIVE",
  });
  const [photo, setPhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
    !hierarchy.stateId ||
    !hierarchy.districtId ||
    !hierarchy.assemblyId ||
    !hierarchy.mandalId ||
    !hierarchy.panchayatId
) {
    setError("Please select the complete hierarchy.");
    return;
}

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (hierarchy.assemblyId) data.append("assemblyId", hierarchy.assemblyId);
    if (hierarchy.mandalId) data.append("mandalId", hierarchy.mandalId);
    if (hierarchy.panchayatId) data.append("panchayatId", hierarchy.panchayatId);
    if (photo) data.append("photo", photo);
    if (idProof) data.append("idProof", idProof);

    setSaving(true);
    try {
      if (isEdit) {
        await memberService.update(member.id, data);
      } else {
        await memberService.create(data);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name</label>
          <input required className="input-field" value={form.fullName} onChange={update("fullName")} />
        </div>
        <div>
          <label className="label">Father's Name</label>
          <input required className="input-field" value={form.fatherName} onChange={update("fatherName")} />
        </div>
        <div>
          <label className="label">Date of Birth</label>
          <input required type="date" className="input-field" value={form.dob} onChange={update("dob")} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input-field" value={form.gender} onChange={update("gender")}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Address</label>
        <textarea required rows={2} className="input-field" value={form.address} onChange={update("address")} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Phone</label>
          <input required maxLength={10} className="input-field" value={form.phone} onChange={update("phone")} />
        </div>
        <div>
          <label className="label">Email (optional)</label>
          <input type="email" className="input-field" value={form.email} onChange={update("email")} />
        </div>
        <div>
          <label className="label">Aadhaar - Last 4 Digits</label>
          <input required maxLength={4} className="input-field" value={form.aadhaarLast4} onChange={update("aadhaarLast4")} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={update("status")}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

  <div>
    <label className="label">State</label>
    <select
      className="input-field"
      value={hierarchy.stateId}
      onChange={(e)=>hierarchy.onStateChange(e.target.value)}
    >
      <option value="">Select State</option>
      {hierarchy.states.map(s=>(
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="label">District</label>
    <select
      className="input-field"
      value={hierarchy.districtId}
      onChange={(e)=>hierarchy.onDistrictChange(e.target.value)}
      disabled={!hierarchy.stateId}
    >
      <option value="">Select District</option>
      {hierarchy.districts.map(d=>(
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="label">Assembly</label>
    <select
      className="input-field"
      value={hierarchy.assemblyId}
      onChange={(e)=>hierarchy.onAssemblyChange(e.target.value)}
      disabled={!hierarchy.districtId}
    >
      <option value="">Select Assembly</option>
      {hierarchy.assemblies.map(a=>(
        <option key={a.id} value={a.id}>{a.name}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="label">Mandal</label>
    <select
      className="input-field"
      value={hierarchy.mandalId}
      onChange={(e)=>hierarchy.onMandalChange(e.target.value)}
      disabled={!hierarchy.assemblyId}
    >
      <option value="">Select Mandal</option>
      {hierarchy.mandals.map(m=>(
        <option key={m.id} value={m.id}>{m.name}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="label">Village Panchayat</label>
    <select
      className="input-field"
      value={hierarchy.panchayatId}
      onChange={(e)=>hierarchy.setPanchayatId(e.target.value)}
      disabled={!hierarchy.mandalId}
    >
      <option value="">Select Panchayat</option>
      {hierarchy.panchayats.map(p=>(
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  </div>

</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Photo {isEdit && "(leave blank to keep existing)"}</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="input-field" onChange={(e) => setPhoto(e.target.files[0])} />
        </div>
        <div>
          <label className="label">ID Proof {isEdit && "(leave blank to keep existing)"}</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="input-field" onChange={(e) => setIdProof(e.target.files[0])} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      </div>
    </form>
  );
}
