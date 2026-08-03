import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services";
import { useAuth } from "../../hooks/useAuth.js";
import logo from "../../assets/logo.png";
export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      await authService.sendAdminOtp(phone);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.verifyAdminOtp(phone, otp);
      login(res.data.token, res.data.admin);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-saffron-50 px-4">
      <div className="card w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-4 overflow-hidden">
  <img
    src={logo}
    alt="BHSF Logo"
    className="w-12 h-12 object-contain"
  />
</div>
          <h1 className="text-lg font-bold text-darkgray">BHSF Admin Login</h1>
          <p className="text-xs text-gray-500 mt-1">Sign in with your registered phone number</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

        {!otpSent ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="label">Phone Number</label>
              <input
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                placeholder="10-digit mobile number"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <div>
              <label className="label">Enter OTP</label>
              <input
                className="input-field"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="6-digit OTP"
              />
              <p className="text-xs text-gray-400 mt-1">
                In development mode, check the server console for the OTP.
              </p>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button type="button" className="text-xs text-gray-500 w-full text-center" onClick={() => setOtpSent(false)}>
              ← Use a different phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
