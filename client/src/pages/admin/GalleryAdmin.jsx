import { useEffect, useState, useCallback } from "react";
import { galleryService } from "../../services";
import { fileUrl } from "../../services/api";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Spinner from "../../components/Spinner.jsx";

export default function GalleryAdmin() {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [photoFiles, setPhotoFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [videoTitle, setVideoTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [addingVideo, setAddingVideo] = useState(false);

  const [deletePhoto, setDeletePhoto] = useState(null);
  const [deleteVideo, setDeleteVideo] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([galleryService.listPhotos(), galleryService.listVideos()])
      .then(([p, v]) => {
        setPhotos(p.data);
        setVideos(v.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadPhotos = async (e) => {
    e.preventDefault();
    if (photoFiles.length === 0) return;
    const data = new FormData();
    photoFiles.forEach((f) => data.append("photos", f));
    if (caption) data.append("caption", caption);

    setUploadingPhotos(true);
    setError("");
    try {
      await galleryService.uploadPhotos(data);
      setPhotoFiles([]);
      setCaption("");
      document.getElementById("photo-input").value = "";
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload photos");
    } finally {
      setUploadingPhotos(false);
    }
  };

  const addVideo = async (e) => {
    e.preventDefault();
    if (!youtubeUrl && !videoFile) {
      setError("Provide a YouTube URL or upload a video file");
      return;
    }
    setError("");
    setAddingVideo(true);
    try {
      if (videoFile) {
        const data = new FormData();
        if (videoTitle) data.append("title", videoTitle);
        data.append("video", videoFile);
        await galleryService.addVideo(data);
      } else {
        await galleryService.addVideo({ title: videoTitle, youtubeUrl });
      }
      setVideoTitle("");
      setYoutubeUrl("");
      setVideoFile(null);
      document.getElementById("video-input").value = "";
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add video");
    } finally {
      setAddingVideo(false);
    }
  };

  const confirmDeletePhoto = async () => {
    setDeleting(true);
    try {
      await galleryService.removePhoto(deletePhoto.id);
      setDeletePhoto(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteVideo = async () => {
    setDeleting(true);
    try {
      await galleryService.removeVideo(deleteVideo.id);
      setDeleteVideo(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Gallery</h1>
      <p className="text-gray-500 text-sm mb-6">Manage the photo and video gallery shown to the public.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

      {/* Upload photos */}
      <div className="card mb-8">
        <h2 className="font-semibold text-darkgray mb-3">Upload Photos</h2>
        <form onSubmit={uploadPhotos} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="label">Photos</label>
            <input id="photo-input" type="file" multiple accept="image/jpeg,image/png,image/webp" className="input-field" onChange={(e) => setPhotoFiles(Array.from(e.target.files))} />
          </div>
          <div className="flex-1 w-full">
            <label className="label">Caption (optional)</label>
            <input className="input-field" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap" disabled={uploadingPhotos}>
            {uploadingPhotos ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {photos.map((p) => (
            <div key={p.id} className="relative group">
              <img src={fileUrl(p.imagePath)} alt={p.caption || ""} className="w-full h-32 object-cover rounded-lg" />
              <button
                onClick={() => setDeletePhoto(p)}
                className="absolute top-1 right-1 bg-white/90 text-red-500 text-xs rounded-full w-6 h-6 flex items-center justify-center shadow"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length === 0 && <p className="text-gray-400 text-sm col-span-full">No photos yet.</p>}
        </div>
      )}

      {/* Add video */}
      <div className="card mb-8">
        <h2 className="font-semibold text-darkgray mb-3">Add Video</h2>
        <form onSubmit={addVideo} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="label">Title (optional)</label>
            <input className="input-field" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">YouTube URL</label>
            <input className="input-field" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <label className="label">Or Upload Video File</label>
            <input id="video-input" type="file" accept="video/mp4,video/webm" className="input-field" onChange={(e) => setVideoFile(e.target.files[0])} />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="btn-primary" disabled={addingVideo}>{addingVideo ? "Adding..." : "Add Video"}</button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {videos.map((v) => (
          <div key={v.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-darkgray">{v.title || "Untitled"}</h3>
              <button className="text-red-500 text-xs" onClick={() => setDeleteVideo(v)}>Delete</button>
            </div>
            <p className="text-xs text-gray-400 break-all">{v.youtubeUrl || v.videoPath}</p>
          </div>
        ))}
        {videos.length === 0 && <p className="text-gray-400 text-sm">No videos yet.</p>}
      </div>

      <ConfirmDialog open={!!deletePhoto} onClose={() => setDeletePhoto(null)} onConfirm={confirmDeletePhoto} loading={deleting} message="Delete this photo?" />
      <ConfirmDialog open={!!deleteVideo} onClose={() => setDeleteVideo(null)} onConfirm={confirmDeleteVideo} loading={deleting} message="Delete this video?" />
    </div>
  );
}
