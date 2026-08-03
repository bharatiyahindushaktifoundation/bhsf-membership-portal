import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { memberService } from "../../services";
import api from "../../services/api";
import { fileUrl } from "../../services/api";
import Spinner from "../../components/Spinner.jsx";

export default function IdCardView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memberService.idCardData(id).then((res) => setData(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-gray-500 text-sm">Member not found.</p>;

  const { member, qrDataUrl, designation } = data;

  const downloadPdf = async () => {
  try {
    const response = await api.get(
      `/members/${member.id}/id-card/pdf`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `${member.memberId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Unable to download PDF.");
  }
};
  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <Link to="/admin/members" className="text-sm text-saffron">← Back to Members</Link>
          <h1 className="page-title mt-2">Member ID Card</h1>
        </div>
        <div className="flex gap-2">
          <button
  onClick={downloadPdf}
  className="btn-secondary text-sm"
>
  Download PDF
</button>
          <button onClick={() => window.print()} className="btn-primary text-sm">Print</button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-[340px] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 print:shadow-none print:border-2">
          <div className="bg-saffron text-white text-center py-5 px-4">
            <p className="font-bold text-sm leading-tight">BHARATIYA HINDU SHAKTI FOUNDATION</p>
            <p className="text-xs opacity-90 mt-1">Membership Identity Card</p>
          </div>
          <div className="p-5 flex flex-col items-center">
            {member.photoPath ? (
              <img src={fileUrl(member.photoPath)} alt={member.fullName} className="w-24 h-28 object-cover rounded-lg border" />
            ) : (
              <div className="w-24 h-28 bg-gray-100 rounded-lg border flex items-center justify-center text-xs text-gray-400">No Photo</div>
            )}
            <h2 className="font-bold text-darkgray mt-3">{member.fullName}</h2>
            <p className="text-xs text-gray-500">{designation}</p>

            <div className="w-full mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Member ID</span><span className="font-medium">{member.memberId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Assembly</span><span className="font-medium">{member.assembly?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Mandal</span><span className="font-medium">{member.mandal?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{member.phone}</span></div>
            </div>

            {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-28 h-28 mt-4" />}
            <p className="text-[10px] text-gray-400 text-center mt-3">
              This card is the property of Bharatiya Hindu Shakti Foundation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
