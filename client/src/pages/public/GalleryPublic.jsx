import { useEffect, useState } from "react";
import { galleryService } from "../../services";
import { fileUrl } from "../../services/api";
import Spinner from "../../components/Spinner.jsx";

function toYoutubeEmbed(url) {
  try {
    const u = new URL(url);
    let videoId = u.searchParams.get("v");
    if (!videoId && u.hostname.includes("youtu.be")) videoId = u.pathname.slice(1);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export default function GalleryPublic() {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([galleryService.listPhotos(), galleryService.listVideos()])
      .then(([p, v]) => {
        setPhotos(p.data);
        setVideos(v.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="page-title">Gallery</h1>
      <p className="text-gray-500 mb-8 text-sm">Photos and videos from our events and activities.</p>

      <h2 className="section-title">Photos</h2>
      {photos.length === 0 ? (
        <p className="text-gray-500 text-sm mb-10">No photos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {photos.map((p) => (
            <div key={p.id}>
              <img src={fileUrl(p.imagePath)} alt={p.caption || "Gallery"} className="w-full h-40 object-cover rounded-lg" />
              {p.caption && <p className="text-xs text-gray-500 mt-1">{p.caption}</p>}
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Videos</h2>
      {videos.length === 0 ? (
        <p className="text-gray-500 text-sm">No videos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {videos.map((v) => {
            const embed = v.youtubeUrl ? toYoutubeEmbed(v.youtubeUrl) : null;
            return (
              <div key={v.id} className="card">
                {v.title && <h3 className="font-semibold text-darkgray mb-2">{v.title}</h3>}
                {embed ? (
                  <div className="aspect-video">
                    <iframe src={embed} className="w-full h-full rounded-lg" title={v.title || "Video"} allowFullScreen />
                  </div>
                ) : v.videoPath ? (
                  <video controls className="w-full rounded-lg">
                    <source src={fileUrl(v.videoPath)} />
                  </video>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
