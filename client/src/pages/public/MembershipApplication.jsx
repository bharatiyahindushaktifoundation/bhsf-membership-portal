import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, applicationService } from "../../services";
import { useLocationHierarchy } from "../../hooks/useLocationHierarchy.js";

const MSG91_WIDGET_ID = "3669626e716a333132303030";

// IMPORTANT:
// Replace this with your NEW MSG91 widget token if you regenerated
// the token after exposing the old one.
const MSG91_TOKEN_AUTH = "566940Ts1I7d0u6a983202P1";

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

  // ------------------------------------------------------------
  // Initialize MSG91 OTP Widget
  // ------------------------------------------------------------

  useEffect(() => {
    const initializeMSG91 = () => {
      if (!window.initSendOTP) {
        console.error("MSG91 OTP widget is not available");
        return;
      }

      const configuration = {
        widgetId: MSG91_WIDGET_ID,
        tokenAuth: MSG91_TOKEN_AUTH,
        exposeMethods: true,

        success: (data) => {
          console.log("MSG91 success:", data);
        },

        failure: (error) => {
          console.error("MSG91 failure:", error);
        },
      };

      window.initSendOTP(configuration);
    };

    if (window.initSendOTP) {
      initializeMSG91();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://verify.msg91.com/otp-provider.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", initializeMSG91);
      return () => {
        existingScript.removeEventListener("load", initializeMSG91);
      };
    }

    const script = document.createElement("script");
    script.src = "https://verify.msg91.com/otp-provider.js";
    script.async = true;

    script.onload = initializeMSG91;

    script.onerror = () => {
      console.error("Failed to load MSG91 OTP widget");
      setError("Unable to load OTP service. Please try again later.");
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  // ------------------------------------------------------------
  // Form helpers
  // ------------------------------------------------------------

  const update = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }));

  // ------------------------------------------------------------
  // Send OTP
  // ------------------------------------------------------------

  const sendOtp = async () => {
    setError("");

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError(
        "Enter a valid 10-digit phone number before requesting an OTP"
      );
      return;
    }

    if (!window.sendOtp) {
      setError("OTP service is not ready. Please refresh the page and try again.");
      return;
    }

    setOtpLoading(true);

    try {
      // First create a verification session in our backend.
      await authService.sendApplicationOtp(form.phone);

      // Then let MSG91 send the actual OTP.
      window.sendOtp(
        `91${form.phone}`,

        (data) => {
          console.log("MSG91 OTP sent:", data);

          setOtpSent(true);
          setOtp("");
          setError("");
          setOtpLoading(false);
        },

        (err) => {
          console.error("MSG91 send OTP failed:", err);

          setError(
            err?.message ||
              err?.response?.data?.message ||
              "Failed to send OTP"
          );

          setOtpLoading(false);
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create OTP verification session"
      );

      setOtpLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Verify OTP
  // ------------------------------------------------------------

  const verifyOtpCode = async () => {
    setError("");

    if (!otp || !/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    if (!window.verifyOtp) {
      setError("OTP service is not ready. Please refresh the page and try again.");
      return;
    }

    setOtpLoading(true);

    try {
      window.verifyOtp(
        otp,

        async (data) => {
          console.log("MSG91 OTP verified:", data);

          // MSG91's widget success response in your working
          // admin implementation returns the JWT in `message`.
          const accessToken =
            data?.message ||
            data?.accessToken ||
            data?.["access-token"] ||
            data?.token;

          if (!accessToken) {
            setError(
              "OTP verified, but MSG91 verification token was not received."
            );
            setOtpLoading(false);
            return;
          }

          try {
            // Send MSG91 access token to our backend.
            await authService.verifyApplicationOtp(
              form.phone,
              accessToken
            );

            setPhoneVerified(true);
            setOtp("");
            setError("");
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Server-side phone verification failed"
            );
          } finally {
            setOtpLoading(false);
          }
        },

        (err) => {
          console.error("MSG91 OTP verification failed:", err);

          setError(
            err?.message ||
              "Invalid OTP. Please check the OTP and try again."
          );

          setOtpLoading(false);
        }
      );
    } catch (err) {
      console.error("OTP verification error:", err);

      setError("OTP verification failed. Please try again.");
      setOtpLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Submit Application
  // ------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setFieldErrors([]);

    if (!phoneVerified) {
      setError(
        "Please verify your phone number via OTP before submitting"
      );
      return;
    }

    if (
      !hierarchy.districtId ||
      !hierarchy.assemblyId ||
      !hierarchy.mandalId ||
      !hierarchy.panchayatId
    ) {
      setError(
        "Please select your full organizational hierarchy (District, Assembly, Mandal, Panchayat)"
      );
      return;
    }

    const data = new FormData();

    Object.entries(form).forEach(([k, v]) => {
      data.append(k, v);
    });

    data.append("districtId", hierarchy.districtId);
    data.append("assemblyId", hierarchy.assemblyId);
    data.append("mandalId", hierarchy.mandalId);
    data.append("panchayatId", hierarchy.panchayatId);

    if (photo) {
      data.append("photo", photo);
    }

    if (idProof) {
      data.append("idProof", idProof);
    }

    setSubmitting(true);

    try {
      const res = await applicationService.submit(data);

      navigate(`/apply/status/${res.data.applicationId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Submission failed"
      );

      setFieldErrors(
        err.response?.data?.errors || []
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="page-title">
        Online Membership Application
      </h1>

      <p className="text-gray-500 mb-8 text-sm">
        Fill in your details below. Your application will be reviewed
        by an administrator before approval.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-5">
          {error}

          {fieldErrors.length > 0 && (
            <ul className="list-disc pl-5 mt-1">
              {fieldErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card space-y-5"
      >
        {/* Personal Information */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>

            <input
              required
              className="input-field"
              value={form.fullName}
              onChange={update("fullName")}
            />
          </div>

          <div>
            <label className="label">Father's Name</label>

            <input
              required
              className="input-field"
              value={form.fatherName}
              onChange={update("fatherName")}
            />
          </div>

          <div>
            <label className="label">Date of Birth</label>

            <input
              required
              type="date"
              className="input-field"
              value={form.dob}
              onChange={update("dob")}
            />
          </div>

          <div>
            <label className="label">Gender</label>

            <select
              required
              className="input-field"
              value={form.gender}
              onChange={update("gender")}
            >
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Address */}

        <div>
          <label className="label">Address</label>

          <textarea
            required
            className="input-field"
            rows={2}
            value={form.address}
            onChange={update("address")}
          />
        </div>

        {/* Location Hierarchy */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">State</label>

            <select
              className="input-field"
              value={hierarchy.stateId}
              onChange={(e) =>
                hierarchy.onStateChange(e.target.value)
              }
            >
              <option value="">Select State</option>

              {hierarchy.states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">District</label>

            <select
              className="input-field"
              value={hierarchy.districtId}
              onChange={(e) =>
                hierarchy.onDistrictChange(e.target.value)
              }
              disabled={!hierarchy.stateId}
            >
              <option value="">Select District</option>

              {hierarchy.districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Assembly</label>

            <select
              className="input-field"
              value={hierarchy.assemblyId}
              onChange={(e) =>
                hierarchy.onAssemblyChange(e.target.value)
              }
              disabled={!hierarchy.districtId}
            >
              <option value="">Select Assembly</option>

              {hierarchy.assemblies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Mandal (Circle)</label>

            <select
              className="input-field"
              value={hierarchy.mandalId}
              onChange={(e) =>
                hierarchy.onMandalChange(e.target.value)
              }
              disabled={!hierarchy.assemblyId}
            >
              <option value="">Select Mandal</option>

              {hierarchy.mandals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Village Panchayat
            </label>

            <select
              className="input-field"
              value={hierarchy.panchayatId}
              onChange={(e) =>
                hierarchy.setPanchayatId(e.target.value)
              }
              disabled={!hierarchy.mandalId}
            >
              <option value="">Select Panchayat</option>

              {hierarchy.panchayats.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone + OTP */}

        <div className="border-t border-gray-200 pt-4">
          <label className="label">
            Phone Number
          </label>

          <div className="flex gap-2">
            <input
              required
              className="input-field"
              value={form.phone}
              onChange={(e) => {
                update("phone")(e);

                setOtpSent(false);
                setPhoneVerified(false);
                setOtp("");
                setError("");
              }}
              maxLength={10}
              placeholder="10-digit mobile number"
              disabled={phoneVerified}
            />

            <button
              type="button"
              className="btn-secondary whitespace-nowrap"
              onClick={sendOtp}
              disabled={
                otpLoading ||
                phoneVerified
              }
            >
              {otpLoading
                ? "Sending..."
                : otpSent
                ? "Resend OTP"
                : "Send OTP"}
            </button>
          </div>

          {otpSent && !phoneVerified && (
            <div className="flex gap-2 mt-3">
              <input
                className="input-field"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                maxLength={6}
                inputMode="numeric"
              />

              <button
                type="button"
                className="btn-primary whitespace-nowrap"
                onClick={verifyOtpCode}
                disabled={
                  otpLoading ||
                  otp.length !== 6
                }
              >
                {otpLoading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>
            </div>
          )}

          {phoneVerified && (
            <p className="text-green-600 text-sm mt-2">
              ✓ Phone number verified
            </p>
          )}
        </div>

        {/* Email + Aadhaar */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">
              Email (optional)
            </label>

            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={update("email")}
            />
          </div>

          <div>
            <label className="label">
              Aadhaar - Last 4 Digits
            </label>

            <input
              required
              maxLength={4}
              className="input-field"
              value={form.aadhaarLast4}
              onChange={update("aadhaarLast4")}
              placeholder="XXXX"
            />
          </div>
        </div>

        {/* Documents */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">
              Passport Size Photo
            </label>

            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="input-field"
              onChange={(e) =>
                setPhoto(e.target.files[0])
              }
            />
          </div>

          <div>
            <label className="label">
              ID Proof Upload (Image or PDF)
            </label>

            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="input-field"
              onChange={(e) =>
                setIdProof(e.target.files[0])
              }
            />
          </div>
        </div>

        {/* Submit */}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={
            submitting ||
            !phoneVerified
          }
        >
          {submitting
            ? "Submitting..."
            : "Submit Application"}
        </button>
      </form>
    </div>
  );
}