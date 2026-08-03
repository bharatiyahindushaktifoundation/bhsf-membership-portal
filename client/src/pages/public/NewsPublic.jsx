import { useEffect, useState } from "react";
import { newsService } from "../../services";
import { fileUrl } from "../../services/api";
import Spinner from "../../components/Spinner.jsx";

export default function NewsPublic() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsService.list().then((res) => setNews(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="page-title">Latest News</h1>
      <p className="text-gray-500 mb-8 text-sm">Updates and announcements from the foundation.</p>

      {loading ? (
        <Spinner />
      ) : news.length === 0 ? (
        <p className="text-gray-500 text-sm">No news published yet.</p>
      ) : (
        <div className="space-y-5">
          {news.map((n) => (
            <div key={n.id} className="card flex flex-col sm:flex-row gap-4">
              {n.imagePath && (
                <img src={fileUrl(n.imagePath)} alt={n.title} className="w-full sm:w-48 h-40 object-cover rounded-lg flex-shrink-0" />
              )}
              <div>
                <p className="text-xs text-gray-400">{new Date(n.date).toLocaleDateString("en-IN")}</p>
                <h3 className="font-semibold text-darkgray text-lg mt-1">{n.title}</h3>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{n.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
