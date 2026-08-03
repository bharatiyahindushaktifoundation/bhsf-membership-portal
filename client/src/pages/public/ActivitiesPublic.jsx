import { useEffect, useState } from "react";
import { activityService } from "../../services";
import { fileUrl } from "../../services/api";
import Spinner from "../../components/Spinner.jsx";

export default function ActivitiesPublic() {
  const [activities, setActivities] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    activityService
      .list(category ? { category } : {})
      .then((res) => setActivities(res.data))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="page-title">Our Activities</h1>
      <p className="text-gray-500 mb-6 text-sm">Community service and outreach programs organized by the foundation.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setCategory("")} className={`px-3 py-1.5 rounded-full text-sm border ${!category ? "bg-saffron text-white border-saffron" : "border-gray-300 text-gray-600"}`}>
          All
        </button>
        {activityService.categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-sm border ${category === c ? "bg-saffron text-white border-saffron" : "border-gray-300 text-gray-600"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : activities.length === 0 ? (
        <p className="text-gray-500 text-sm">No activities found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((a) => (
            <div key={a.id} className="card">
              {a.images?.[0] && (
                <img src={fileUrl(a.images[0].imagePath)} alt={a.title} className="w-full h-44 object-cover rounded-lg mb-3" />
              )}
              <span className="text-xs font-medium text-saffron">{a.category}</span>
              <h3 className="font-semibold text-darkgray mt-1">{a.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{new Date(a.date).toLocaleDateString("en-IN")}</p>
              <p className="text-sm text-gray-600 mt-2">{a.description}</p>
              {a.report && <p className="text-sm text-gray-500 mt-2 italic">Report: {a.report}</p>}
              {a.images?.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {a.images.slice(1).map((img) => (
                    <img key={img.id} src={fileUrl(img.imagePath)} className="w-16 h-16 object-cover rounded-md flex-shrink-0" alt="" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
