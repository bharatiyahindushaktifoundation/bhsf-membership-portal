import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services";
import { useAuth } from "../../hooks/useAuth.js";
import logo from "../../assets/logo.png";

const MSG91_WIDGET_ID = "3669626e716a333132303030";
const MSG91_TOKEN_AUTH = "566940Ts1I7d0u6a983202P1";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load MSG91 OTP Widget
  // Initialize MSG91 OTP Widget
useEffect(() => {
  const initializeMSG91 = () => {
    if (!window.initSendOTP) {
      console.error("MSG91 initSendOTP is not available");
      setError("OTP service could not be initialized.");
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

    console.log("MSG91 OTP Widget initialized");
  };

  // Already loaded
  if (window.initSendOTP) {
    initializeMSG91();
    return;
  }

  // Check if script is already being loaded
  const existingScript = document.querySelector(
    'script[src="https://verify.msg91.com/otp-provider.js"]'
  );

  if (existingScript) {
    existingScript.addEventListener(
      "load",
      initializeMSG91
    );

    return;
  }

  // Load MSG91 script
  const script = document.createElement("script");

  script.src =
    "https://verify.msg91.com/otp-provider.js";

  script.async = true;

  script.onload = initializeMSG91;

  script.onerror = () => {
    console.error(
      "Failed to load MSG91 OTP Widget"
    );

    setError(
      "Unable to load OTP service. Please try again."
    );
  };

  document.body.appendChild(script);
}, []);

  const sendOtp = async (e) => {
    e.preventDefault();

    setError("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    if (!window.sendOtp) {
      setError("OTP service is still loading. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // First check whether this phone belongs to an active BHSF admin.
      await authService.sendAdminOtp(phone);

      const identifier = `91${phone}`;

console.log("Sending MSG91 OTP...");
console.log("Phone:", phone);
console.log("Identifier:", identifier);
console.log("sendOtp function:", window.sendOtp);

window.sendOtp(
  identifier,
  (data) => {
    console.log("========== MSG91 SUCCESS ==========");
    console.log("Response:", data);
    console.log("===================================");

    setOtpSent(true);
    setLoading(false);
  },
  (error) => {
    console.log("========== MSG91 FAILURE ==========");
    console.log("Full error:", error);
    console.log("Error JSON:", JSON.stringify(error, null, 2));
    console.log("Error message:", error?.message);
    console.log("====================================");

    setError(
      error?.message ||
        "Failed to send OTP. Check browser console."
    );

    setLoading(false);
  }
);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP"
      );

      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();

    setError("");

    if (!otp || !/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP");
      return;
    }

    if (!window.verifyOtp) {
      setError("OTP service is not available. Please try again.");
      return;
    }

    setLoading(true);

    window.verifyOtp(
      otp,
      async (data) => {
        console.log("MSG91 OTP verified:", data);

        try {
          /*
           * MSG91 returns the verification token in the
           * success response.
           */
          const accessToken =
  data?.accessToken ||
  data?.["access-token"] ||
  data?.token ||
  data?.message;

if (!accessToken) {
  console.error("MSG91 response:", data);

  setError(
    "OTP verified, but verification token was not received."
  );

  setLoading(false);
  return;
}

console.log("MSG91 access token received");

          // Send the MSG91 access token to BHSF backend.
          const res = await authService.verifyAdminOtp(
            phone,
            accessToken
          );

          // Existing BHSF authentication remains unchanged.
          login(
            res.data.token,
            res.data.admin
          );

          navigate("/admin/dashboard");
        } catch (err) {
          console.error(err);

          setError(
            err.response?.data?.message ||
              "Admin authentication failed."
          );

          setLoading(false);
        }
      },
      (error) => {
        console.error("MSG91 OTP verification failed:", error);

        setError(
          error?.message ||
            "Invalid OTP. Please try again."
        );

        setLoading(false);
      }
    );
  };

  const changePhone = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
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

          <h1 className="text-lg font-bold text-darkgray">
            BHSF Admin Login
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Sign in with your registered phone number
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form
            onSubmit={sendOtp}
            className="space-y-4"
          >
            <div>
              <label className="label">
                Phone Number
              </label>

              <input
                className="input-field"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                maxLength={10}
                placeholder="10-digit mobile number"
                inputMode="numeric"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={verify}
            className="space-y-4"
          >
            <div>
              <label className="label">
                Enter OTP
              </label>

              <input
                className="input-field"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                maxLength={6}
                placeholder="6-digit OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
              />

              <p className="text-xs text-gray-400 mt-1">
                Please enter the 6-digit OTP received on
                your phone.
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Verify & Login"}
            </button>

            <button
              type="button"
              className="text-xs text-gray-500 w-full text-center"
              onClick={changePhone}
              disabled={loading}
            >
              ← Use a different phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}