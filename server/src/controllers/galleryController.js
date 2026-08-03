const prisma = require("../config/db");
const path = require("path");

// ---------- Photos ----------

async function listPhotos(req, res, next) {
  try {
    const photos = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
    res.json(photos);
  } catch (err) {
    next(err);
  }
}

async function uploadPhotos(req, res, next) {
  try {
    if (!req.files?.length) return res.status(400).json({ message: "At least one photo is required" });
    const caption = req.body.caption || null;
    const created = await prisma.$transaction(
  req.files.map((f) =>
    prisma.galleryImage.create({
      data: {
        imagePath: `/uploads/${path.basename(f.destination)}/${f.filename}`,
        caption,
      },
    })
  )
);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function deletePhoto(req, res, next) {
  try {
    await prisma.galleryImage.delete({ where: { id: req.params.id } });
    res.json({ message: "Photo deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Photo not found" });
    next(err);
  }
}

// ---------- Videos ----------

async function listVideos(req, res, next) {
  try {
    const videos = await prisma.galleryVideo.findMany({ orderBy: { createdAt: "desc" } });
    res.json(videos);
  } catch (err) {
    next(err);
  }
}

async function addVideo(req, res, next) {
  try {
    const { title, youtubeUrl } = req.body;
    const videoPath = req.file
  ? `/uploads/${path.basename(req.file.destination)}/${req.file.filename}`
  : null;
    if (!youtubeUrl && !videoPath) {
      return res.status(400).json({ message: "Provide either a YouTube URL or an uploaded video file" });
    }

    const video = await prisma.galleryVideo.create({
      data: { title: title || null, youtubeUrl: youtubeUrl || null, videoPath },
    });
    res.status(201).json(video);
  } catch (err) {
    next(err);
  }
}

async function deleteVideo(req, res, next) {
  try {
    await prisma.galleryVideo.delete({ where: { id: req.params.id } });
    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Video not found" });
    next(err);
  }
}

module.exports = { listPhotos, uploadPhotos, deletePhoto, listVideos, addVideo, deleteVideo };
