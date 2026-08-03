import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { applicationService } from "../../services";
import StatusBadge from "../../components/StatusBadge.jsx";
import Spinner from "../../components/Spinner.jsx";

export default function ApplicationStatus() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    applicationService
      .status(id)
      .then((res) => setApplication(res.data))
      .catch(() => setError("Application not found"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      {loading && <Spinner />}
      {error && <p className="text-red-600">{error}</p>}
      {application && (
        <div className="card">
          <h1 className="page-title">Application Submitted</h1>
          <p className="text-gray-500 text-sm mb-5">Thank you, {application.fullName}. Here is your application status.</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <StatusBadge status={application.status} />
          </div>
          {application.rejectionReason && (
            <p className="text-sm text-red-600 mb-4">Reason: {application.rejectionReason}</p>
          )}
          <p className="text-xs text-gray-400 mb-6">Reference ID: {application.id}</p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      )}
    </div>
  );
}
