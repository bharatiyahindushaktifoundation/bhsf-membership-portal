import { useEffect, useState } from "react";
import { dashboardService } from "../../services";
import Spinner from "../../components/Spinner.jsx";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    dashboardService.summary().then((res) => setSummary(res.data));
  }, []);

  if (!summary) return <Spinner label="Loading dashboard..." />;

  const cards = [
    { label: "Total Members", value: summary.totalMembers, color: "bg-saffron-50 text-saffron-700" },
    { label: "Pending Applications", value: summary.pendingApplications, color: "bg-yellow-50 text-yellow-700" },
    { label: "Approved Members", value: summary.approvedMembers, color: "bg-green-50 text-green-700" },
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Overview of membership activity.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map((c) => (
          <div key={c.label} className={`card ${c.color}`}>
            <p className="text-sm font-medium opacity-80">{c.label}</p>
            <p className="text-4xl font-bold mt-2">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
