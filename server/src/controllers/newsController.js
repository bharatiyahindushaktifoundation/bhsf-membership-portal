const prisma = require("../config/db");
const path = require("path");
async function listNews(req, res, next) {
  try {
    const { limit } = req.query;
    const news = await prisma.news.findMany({
      orderBy: { date: "desc" },
      take: limit ? Number(limit) : undefined,
    });
    res.json(news);
  } catch (err) {
    next(err);
  }
}

async function getNewsItem(req, res, next) {
  try {
    const item = await prisma.news.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: "News item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function createNews(req, res, next) {
  try {
    const { title, description, date } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }
    const imagePath = req.file
  ? `/uploads/${path.basename(req.file.destination)}/${req.file.filename}`
  : null;
    const item = await prisma.news.create({
      data: {
        title: title.trim(),
        description,
        date: date ? new Date(date) : new Date(),
        imagePath,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function updateNews(req, res, next) {
  try {
    const { title, description, date } = req.body;
    const data = {};
    if (title) data.title = title.trim();
    if (description) data.description = description;
    if (date) data.date = new Date(date);
    if (req.file) {
    data.imagePath = `/uploads/${path.basename(req.file.destination)}/${req.file.filename}`;
    }

    const item = await prisma.news.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "News item not found" });
    next(err);
  }
}

async function deleteNews(req, res, next) {
  try {
    await prisma.news.delete({ where: { id: req.params.id } });
    res.json({ message: "News item deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "News item not found" });
    next(err);
  }
}

module.exports = { listNews, getNewsItem, createNews, updateNews, deleteNews };
