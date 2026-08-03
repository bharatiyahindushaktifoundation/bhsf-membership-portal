import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { homeContentService, activityService, newsService, galleryService } from "../../services";
import { fileUrl } from "../../services/api";
import Spinner from "../../components/Spinner.jsx";

export default function Home() {
  const [content, setContent] = useState(null);
  const [activities, setActivities] = useState([]);
  const [news, setNews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      homeContentService.getAll(),
      activityService.list(),
      newsService.list({ limit: 3 }),
      galleryService.listPhotos(),
    ])
      .then(([c, a, n, g]) => {
        setContent(c.data);
        setActivities(a.data.slice(0, 3));
        setNews(n.data);
        setPhotos(g.data.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading homepage..." />;

  return (
    <div>
      {/* Hero */}
     
<section
  className="relative bg-gradient-to-b from-saffron-50 to-white border-b border-gray-200 bg-cover bg-center"
  style={
    content.HERO.imagePath
      ? {
          backgroundImage: `linear-gradient(rgba(255,255,255,0.82), rgba(255,255,255,0.82)), url("${fileUrl(
            content.HERO.imagePath
          )}")`,
        }
      : undefined
  }
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
    <h1 className="text-3xl sm:text-5xl font-bold text-darkgray mb-4">
      {content.HERO.heading || "Bharatiya Hindu Shakti Foundation"}
    </h1>

    <p className="text-gray-600 max-w-2xl mx-auto mb-8 whitespace-pre-line">
      {content.HERO.body || "Serving society, strengthening culture."}
    </p>

    <div className="flex justify-center gap-3">
      <Link to="/apply" className="btn-primary">
        Become a Member
      </Link>
      <Link to="/activities" className="btn-secondary">
        View Activities
      </Link>
    </div>
  </div>
</section>

      {/* About */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
    <div>
      <h2 className="section-title">
        {content.ABOUT.heading || "About Us"}
      </h2>

      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
        {content.ABOUT.body}
      </p>
    </div>

    {content.ABOUT.imagePath && (
      <img
        src={fileUrl(content.ABOUT.imagePath)}
        alt={content.ABOUT.heading || "About organization"}
        className="w-full max-h-80 object-cover rounded-xl shadow-sm"
      />
    )}
  </div>
</section>

      {/* Objectives */}
<section className="bg-white border-y border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {content.OBJECTIVES.imagePath && (
        <img
          src={fileUrl(content.OBJECTIVES.imagePath)}
          alt={content.OBJECTIVES.heading || "Objectives and goals"}
          className="w-full max-h-80 object-cover rounded-xl shadow-sm"
        />
      )}

      <div>
        <h2 className="section-title">
          {content.OBJECTIVES.heading || "Our Objectives & Goals"}
        </h2>

        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {content.OBJECTIVES.body}
        </p>
      </div>
    </div>
  </div>
</section>

      {/* Ongoing Activities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Ongoing Activities</h2>
          <Link to="/activities" className="text-sm text-saffron font-medium">View all →</Link>
        </div>
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm">No activities published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {activities.map((a) => (
              <div key={a.id} className="card">
                {a.images?.[0] && (
                  <img
                    src={fileUrl(a.images[0].imagePath)}
                    alt={a.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                <span className="text-xs font-medium text-saffron">{a.category}</span>
                <h3 className="font-semibold text-darkgray mt-1">{a.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* News */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Latest News</h2>
            <Link to="/news" className="text-sm text-saffron font-medium">View all →</Link>
          </div>
          {news.length === 0 ? (
            <p className="text-gray-500 text-sm">No news published yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {news.map((n) => (
                <div key={n.id} className="card">
                  {n.imagePath && (
                    <img src={fileUrl(n.imagePath)} alt={n.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                  )}
                  <h3 className="font-semibold text-darkgray">{n.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.date).toLocaleDateString("en-IN")}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Photo Gallery</h2>
          <Link to="/gallery" className="text-sm text-saffron font-medium">View all →</Link>
        </div>
        {photos.length === 0 ? (
          <p className="text-gray-500 text-sm">No photos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photos.map((p) => (
              <img key={p.id} src={fileUrl(p.imagePath)} alt={p.caption || "Gallery"} className="w-full h-32 object-cover rounded-lg" />
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
<section className="bg-darkgray text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div>
        <h2 className="text-2xl font-bold mb-3">
          {content.CONTACT.heading || "Contact Us"}
        </h2>

        <p className="text-gray-300 whitespace-pre-line">
          {content.CONTACT.body}
        </p>
      </div>

      {content.CONTACT.imagePath && (
        <img
          src={fileUrl(content.CONTACT.imagePath)}
          alt={content.CONTACT.heading || "Contact"}
          className="w-full max-h-72 object-cover rounded-xl"
        />
      )}
    </div>
  </div>
</section>
    </div>
  );
}
