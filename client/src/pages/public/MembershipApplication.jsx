import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, applicationService } from "../../services";
import { useLocationHierarchy } from "../../hooks/useLocationHierarchy.js";

const initialForm = {
  fullName: "",
  fatherName: "",
  dob: "",
  gender: "",
  address: "",
  phone: "",
  email: "",
  aadhaarLast4: "",
};

export default function MembershipApplication() {
  const navigate = useNavigate();
  const hierarchy = useLocationHierarchy();
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const sendOtp = async () => {
    setError("");
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Enter a valid 10-digit phone number before requesting an OTP");
      return;
    }
    setOtpLoading(true);
    try {
      await authService.sendApplicationOtp(form.phone);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtpCode = async () => {
    setError("");
    setOtpLoading(true);
    try {
      await authService.verifyApplicationOtp(form.phone, otp);
      setPhoneVerified(true);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors([]);

    if (!phoneVerified) {
      setError("Please verify your phone number via OTP before submitting");
      return;
    }
    if (!hierarchy.districtId || !hierarchy.assemblyId || !hierarchy.mandalId || !hierarchy.panchayatId) {
      setError("Please select your full organizational hierarchy (District, Assembly, Mandal, Panchayat)");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append("districtId", hierarchy.districtId);
    data.append("assemblyId", hierarchy.assemblyId);
    data.append("mandalId", hierarchy.mandalId);
    data.append("panchayatId", hierarchy.panchayatId);
    if (photo) data.append("photo", photo);
    if (idProof) data.append("idProof", idProof);

    setSubmitting(true);
    try {
      const res = await applicationService.submit(data);
      navigate(`/apply/status/${res.data.applicationId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
      setFieldErrors(err.response?.data?.errors || []);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="page-title">Online Membership Application</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Fill in your details below. Your application will be reviewed by an administrator before approval.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-5">
          {error}
          {fieldErrors.length > 0 && (
            <ul className="list-disc pl-5 mt-1">
              {fieldErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
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
            <select required className="input-field" value={form.gender} onChange={update("gender")}>
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <textarea required className="input-field" rows={2} value={form.address} onChange={update("address")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">State</label>
            <select className="input-field" value={hierarchy.stateId} onChange={(e) => hierarchy.onStateChange(e.target.value)}>
              <option value="">Select State</option>
              {hierarchy.states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">District</label>
            <select className="input-field" value={hierarchy.districtId} onChange={(e) => hierarchy.onDistrictChange(e.target.value)} disabled={!hierarchy.stateId}>
              <option value="">Select District</option>
              {hierarchy.districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assembly</label>
            <select className="input-field" value={hierarchy.assemblyId} onChange={(e) => hierarchy.onAssemblyChange(e.target.value)} disabled={!hierarchy.districtId}>
              <option value="">Select Assembly</option>
              {hierarchy.assemblies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Mandal (Circle)</label>
            <select className="input-field" value={hierarchy.mandalId} onChange={(e) => hierarchy.onMandalChange(e.target.value)} disabled={!hierarchy.assemblyId}>
              <option value="">Select Mandal</option>
              {hierarchy.mandals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Village Panchayat</label>
            <select className="input-field" value={hierarchy.panchayatId} onChange={(e) => hierarchy.setPanchayatId(e.target.value)} disabled={!hierarchy.mandalId}>
              <option value="">Select Panchayat</option>
              {hierarchy.panchayats.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Phone + OTP */}
        <div className="border-t border-gray-200 pt-4">
          <label className="label">Phone Number</label>
          <div className="flex gap-2">
            <input
              required
              className="input-field"
              value={form.phone}
              onChange={(e) => {
                update("phone")(e);
                setOtpSent(false);
                setPhoneVerified(false);
              }}
              maxLength={10}
              placeholder="10-digit mobile number"
              disabled={phoneVerified}
            />
            <button type="button" className="btn-secondary whitespace-nowrap" onClick={sendOtp} disabled={otpLoading || phoneVerified}>
              {otpSent ? "Resend OTP" : "Send OTP"}
            </button>
          </div>

          {otpSent && !phoneVerified && (
            <div className="flex gap-2 mt-3">
              <input
                className="input-field"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              <button type="button" className="btn-primary whitespace-nowrap" onClick={verifyOtpCode} disabled={otpLoading}>
                Verify OTP
              </button>
            </div>
          )}
          {phoneVerified && <p className="text-green-600 text-sm mt-2">✓ Phone number verified</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email (optional)</label>
            <input type="email" className="input-field" value={form.email} onChange={update("email")} />
          </div>
          <div>
            <label className="label">Aadhaar - Last 4 Digits</label>
            <input required maxLength={4} className="input-field" value={form.aadhaarLast4} onChange={update("aadhaarLast4")} placeholder="XXXX" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Passport Size Photo</label>
            <input required type="file" accept="image/jpeg,image/png,image/webp" className="input-field" onChange={(e) => setPhoto(e.target.files[0])} />
          </div>
          <div>
            <label className="label">ID Proof Upload (Image or PDF)</label>
            <input required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="input-field" onChange={(e) => setIdProof(e.target.files[0])} />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
