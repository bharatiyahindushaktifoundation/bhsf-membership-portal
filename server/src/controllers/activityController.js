const prisma = require("../config/db");
const path = require("path");
const CATEGORIES = ["Blood Donation Camp", "Tree Plantation", "Social Service", "Meeting", "Event"];

async function listActivities(req, res, next) {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const activities = await prisma.activity.findMany({
      where,
      include: { images: true },
      orderBy: { date: "desc" },
    });
    res.json(activities);
  } catch (err) {
    next(err);
  }
}

async function getActivity(req, res, next) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: { images: true },
    });
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch (err) {
    next(err);
  }
}

async function createActivity(req, res, next) {
  try {
    const { title, description, category, date, report } = req.body;
    if (!title || !description || !category || !date) {
      return res.status(400).json({ message: "Title, description, category and date are required" });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${CATEGORIES.join(", ")}` });
    }

    const images = (req.files || []).map((f) => ({
      imagePath: `/uploads/${path.basename(f.destination)}/${f.filename}`,
    }));

    const activity = await prisma.activity.create({
      data: {
        title: title.trim(),
        description,
        category,
        date: new Date(date),
        report: report || null,
        images: { create: images },
      },
      include: { images: true },
    });
    res.status(201).json(activity);
  } catch (err) {
    next(err);
  }
}

async function updateActivity(req, res, next) {
  try {
    const { title, description, category, date, report } = req.body;
    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${CATEGORIES.join(", ")}` });
    }

    const data = {};
    if (title) data.title = title.trim();
    if (description) data.description = description;
    if (category) data.category = category;
    if (date) data.date = new Date(date);
    if (report !== undefined) data.report = report;

    if (req.files?.length) {
  data.images = {
    create: req.files.map((f) => ({
      imagePath: `/uploads/${path.basename(f.destination)}/${f.filename}`,
    })),
  };
}

    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data,
      include: { images: true },
    });
    res.json(activity);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Activity not found" });
    next(err);
  }
}

async function deleteActivity(req, res, next) {
  try {
    await prisma.activity.delete({ where: { id: req.params.id } });
    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Activity not found" });
    next(err);
  }
}

async function deleteActivityImage(req, res, next) {
  try {
    await prisma.activityImage.delete({ where: { id: req.params.imageId } });
    res.json({ message: "Image removed" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Image not found" });
    next(err);
  }
}

module.exports = {
  CATEGORIES,
  listActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  deleteActivityImage,
};
