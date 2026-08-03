const prisma = require("../config/db");
const path = require("path");

const SECTIONS = ["HERO", "ABOUT", "OBJECTIVES", "CONTACT"];

async function getAllContent(req, res, next) {
  try {
    const rows = await prisma.homeContent.findMany();
    const bySection = {};
    SECTIONS.forEach((s) => {
      bySection[s] = rows.find((r) => r.section === s) || { section: s, heading: "", body: "", imagePath: null };
    });
    res.json(bySection);
  } catch (err) {
    next(err);
  }
}

async function updateSection(req, res, next) {
  try {
    const section = req.params.section?.toUpperCase();
    if (!SECTIONS.includes(section)) {
      return res.status(400).json({ message: `Section must be one of: ${SECTIONS.join(", ")}` });
    }
    const { heading, body } = req.body;
    const data = { heading, body };
    if (req.file) {
    data.imagePath = `/uploads/${path.basename(req.file.destination)}/${req.file.filename}`;
    }

    const content = await prisma.homeContent.upsert({
      where: { section },
      update: data,
      create: { section, ...data },
    });
    res.json(content);
  } catch (err) {
    next(err);
  }
}

module.exports = { SECTIONS, getAllContent, updateSection };
