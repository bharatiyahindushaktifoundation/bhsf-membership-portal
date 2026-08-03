const prisma = require("../config/db");

// Generic CRUD factory for the five hierarchy levels. Keeps controllers
// short and consistent while still allowing model-specific includes.

const LEVELS = {
  state: {
    model: prisma.state,
    include: {},
  },
  district: {
    model: prisma.district,
    include: { state: true },
  },
  assembly: {
    model: prisma.assembly,
    include: { district: { include: { state: true } } },
  },
  mandal: {
    model: prisma.mandal,
    include: { assembly: { include: { district: true } } },
  },
  panchayat: {
    model: prisma.villagePanchayat,
    include: { mandal: { include: { assembly: true } } },
  },
};

function getLevel(levelName) {
  const level = LEVELS[levelName];
  if (!level) {
    const err = new Error("Unknown hierarchy level");
    err.status = 400;
    throw err;
  }
  return level;
}

// ---------- Generic list / create / update / delete ----------

async function list(req, res, next) {
  try {
    const level = getLevel(req.params.level);
    const where = {};

    // Optional filters to scope dropdowns, e.g. ?districtId=... for assemblies
    ["stateId", "districtId", "assemblyId", "mandalId"].forEach((key) => {
      if (req.query[key]) where[key] = req.query[key];
    });

    const items = await level.model.findMany({
      where,
      include: level.include,
      orderBy: { name: "asc" },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const level = getLevel(req.params.level);
    const { name, stateId, districtId, assemblyId, mandalId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const data = { name: name.trim() };
    if (req.params.level === "district") data.stateId = stateId;
    if (req.params.level === "assembly") data.districtId = districtId;
    if (req.params.level === "mandal") data.assemblyId = assemblyId;
    if (req.params.level === "panchayat") data.mandalId = mandalId;

    const item = await level.model.create({ data });
    res.status(201).json(item);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "An entry with this name already exists at this level" });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const level = getLevel(req.params.level);
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const item = await level.model.update({
      where: { id: req.params.id },
      data: { name: name.trim() },
    });
    res.json(item);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Not found" });
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const level = getLevel(req.params.level);
    await level.model.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Not found" });
    if (err.code === "P2003") {
      return res.status(409).json({ message: "Cannot delete: records exist beneath this entry" });
    }
    next(err);
  }
}

module.exports = { list, create, update, remove };
