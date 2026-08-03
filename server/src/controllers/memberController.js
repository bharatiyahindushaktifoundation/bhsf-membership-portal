const path = require("path");
const prisma = require("../config/db");
const { generateMemberId } = require("../utils/generateMemberId");
const { generateMemberQrDataUrl } = require("../utils/qrGenerator");
const { streamIdCardPdf } = require("../utils/pdfGenerator");
const { isValidPhone, isValidEmail, isValidAadhaarLast4 } = require("../middleware/validate");

const memberInclude = {
  assembly: true,
  mandal: true,
  panchayat: true,
  designation: { include: { department: true } },
};

async function listMembers(req, res, next) {
  try {
    const { assemblyId, mandalId, panchayatId, search, status } = req.query;
    const where = {};
    if (assemblyId) where.assemblyId = assemblyId;
    if (mandalId) where.mandalId = mandalId;
    if (panchayatId) where.panchayatId = panchayatId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { memberId: { contains: search, mode: "insensitive" } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      include: memberInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json(members);
  } catch (err) {
    next(err);
  }
}

async function getMember(req, res, next) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: memberInclude,
    });
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  } catch (err) {
    next(err);
  }
}

// Directly add a member (bypassing the public application flow) from the admin panel.
async function createMember(req, res, next) {
  try {
    const { fullName, fatherName, dob, gender, address, phone, email, aadhaarLast4, assemblyId, mandalId, panchayatId } = req.body;

    if (!fullName || !fatherName || !dob || !gender || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!isValidPhone(phone)) return res.status(400).json({ message: "Valid phone number required" });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Invalid email" });
    if (!isValidAadhaarLast4(aadhaarLast4)) return res.status(400).json({ message: "Aadhaar last 4 digits invalid" });
    if (!assemblyId || !mandalId || !panchayatId) return res.status(400).json({ message: "Full hierarchy selection required" });

    const assembly = await prisma.assembly.findUnique({
      where: { id: assemblyId },
      include: { district: { include: { state: true } } },
    });
    if (!assembly) return res.status(400).json({ message: "Invalid assembly" });

    const memberId = await generateMemberId(assembly.district?.state?.name);
    const photoFile = req.files?.photo?.[0];
    const idProofFile = req.files?.idProof?.[0];

    const photoPath = photoFile
      ? `/uploads/${path.basename(photoFile.destination)}/${photoFile.filename}`
      : null;

    const idProofPath = idProofFile
      ? `/uploads/${path.basename(idProofFile.destination)}/${idProofFile.filename}`
      : null;

    const member = await prisma.member.create({
      data: {
        memberId,
        fullName: fullName.trim(),
        fatherName: fatherName.trim(),
        dob: new Date(dob),
        gender,
        address: address.trim(),
        phone,
        email: email || null,
        aadhaarLast4,
        photoPath,
        idProofPath,
        assemblyId,
        mandalId,
        panchayatId,
      },
      include: memberInclude,
    });

    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

async function updateMember(req, res, next) {
  try {
    const existing = await prisma.member.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Member not found" });

    const { fullName, fatherName, dob, gender, address, phone, email, status, assemblyId, mandalId, panchayatId } = req.body;

    if (phone && !isValidPhone(phone)) return res.status(400).json({ message: "Valid phone number required" });
    if (email && !isValidEmail(email)) return res.status(400).json({ message: "Invalid email" });

    const data = {};
    if (fullName) data.fullName = fullName.trim();
    if (fatherName) data.fatherName = fatherName.trim();
    if (dob) data.dob = new Date(dob);
    if (gender) data.gender = gender;
    if (address) data.address = address.trim();
    if (phone) data.phone = phone;
    if (email !== undefined) data.email = email || null;
    if (status) data.status = status;
    if (assemblyId) data.assemblyId = assemblyId;
    if (mandalId) data.mandalId = mandalId;
    if (panchayatId) data.panchayatId = panchayatId;
    if (req.files?.photo?.[0]) {
      data.photoPath = `/uploads/${path.basename(req.files.photo[0].destination)}/${req.files.photo[0].filename}`;
    }

    if (req.files?.idProof?.[0]) {
      data.idProofPath = `/uploads/${path.basename(req.files.idProof[0].destination)}/${req.files.idProof[0].filename}`;
    }

    const member = await prisma.member.update({
      where: { id: req.params.id },
      data,
      include: memberInclude,
    });
    res.json(member);
  } catch (err) {
    next(err);
  }
}

async function deleteMember(req, res, next) {
  try {
    await prisma.member.delete({ where: { id: req.params.id } });
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Member not found" });
    next(err);
  }
}

// ---------- ID Card ----------

async function getIdCardData(req, res, next) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: memberInclude,
    });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const qrDataUrl = await generateMemberQrDataUrl(member.memberId);
    res.json({
      member,
      qrDataUrl,
      designation: member.designation?.[0]?.department?.title || "Member",
    });
  } catch (err) {
    next(err);
  }
}

async function downloadIdCardPdf(req, res, next) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: memberInclude,
    });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const qrDataUrl = await generateMemberQrDataUrl(member.memberId);
    const logoPath = path.resolve(__dirname, "../../assets/logo.png");

console.log("Current __dirname:", __dirname);
console.log("Resolved logo path:", logoPath);
console.log("Exists:", require("fs").existsSync(logoPath));

    const fs = require("fs");

console.log("Current __dirname:", __dirname);
console.log("Logo path:", logoPath);

    streamIdCardPdf(res, {
      member: {
        ...member,
        assemblyName: member.assembly?.name,
        mandalName: member.mandal?.name,
        designation: member.designation?.[0]?.department?.title,
      },
      qrDataUrl,
      logoPath,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getIdCardData,
  downloadIdCardPdf,
};
