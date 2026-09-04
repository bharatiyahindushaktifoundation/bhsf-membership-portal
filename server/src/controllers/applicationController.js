const prisma = require("../config/db");
const path = require("path");
const { validateApplicationPayload } = require("../middleware/validate");
const { generateMemberId } = require("../utils/generateMemberId");

// ---------- Public ----------

async function submitApplication(req, res, next) {
  try {
    const errors = validateApplicationPayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

// The applicant must have verified their phone via MSG91 OTP
// before submitting the application.
const verifiedPhone =
  await prisma.applicationPhoneVerification.findFirst({
    where: {
      phone: req.body.phone,
      isVerified: true,
      verifiedAt: {
        not: null,
      },
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      verifiedAt: "desc",
    },
  });

if (!verifiedPhone) {
  return res.status(400).json({
    message:
      "Phone number is not verified. Please verify via OTP first.",
  });
}

    const photo = req.files?.photo?.[0];
    const idProof = req.files?.idProof?.[0];

    const photoPath = photo
      ? `/uploads/${path.basename(photo.destination)}/${photo.filename}`
      : null;

    const idProofPath = idProof
      ? `/uploads/${path.basename(idProof.destination)}/${idProof.filename}`
      : null;

    const application = await prisma.membershipApplication.create({
      data: {
        fullName: req.body.fullName.trim(),
        fatherName: req.body.fatherName.trim(),
        dob: new Date(req.body.dob),
        gender: req.body.gender,
        address: req.body.address.trim(),
        districtId: req.body.districtId,
        assemblyId: req.body.assemblyId,
        mandalId: req.body.mandalId,
        panchayatId: req.body.panchayatId,
        phone: req.body.phone,
        phoneVerified: true,
        email: req.body.email || null,
        aadhaarLast4: req.body.aadhaarLast4,
        photoPath,
        idProofPath,
        status: "PENDING",
      },
    });

    // Mark phone verification as used
await prisma.applicationPhoneVerification.update({
  where: {
    id: verifiedPhone.id,
  },
  data: {
    usedAt: new Date(),
  },
});

    res.status(201).json({
      message: "Application submitted successfully. It is now pending review.",
      applicationId: application.id,
    });
  } catch (err) {
    next(err);
  }
}

async function getApplicationStatus(req, res, next) {
  try {
    const application = await prisma.membershipApplication.findUnique({
      where: { id: req.params.id },
      select: { id: true, fullName: true, status: true, rejectionReason: true, createdAt: true },
    });
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (err) {
    next(err);
  }
}

// ---------- Admin ----------

async function listApplications(req, res, next) {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const applications = await prisma.membershipApplication.findMany({
      where,
      include: { district: true, assembly: true, mandal: true, panchayat: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  } catch (err) {
    next(err);
  }
}

async function getApplication(req, res, next) {
  try {
    const application = await prisma.membershipApplication.findUnique({
      where: { id: req.params.id },
      include: { district: true, assembly: true, mandal: true, panchayat: true },
    });
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (err) {
    next(err);
  }
}

async function approveApplication(req, res, next) {
  try {
    const application = await prisma.membershipApplication.findUnique({
      where: { id: req.params.id },
      include: { assembly: { include: { district: { include: { state: true } } } } },
    });
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "PENDING") {
      return res.status(400).json({ message: `Application already ${application.status.toLowerCase()}` });
    }

    const memberId = await generateMemberId(application.assembly?.district?.state?.name);

    const member = await prisma.$transaction(async (tx) => {
      const created = await tx.member.create({
        data: {
          memberId,
          fullName: application.fullName,
          fatherName: application.fatherName,
          dob: application.dob,
          gender: application.gender,
          address: application.address,
          phone: application.phone,
          email: application.email,
          aadhaarLast4: application.aadhaarLast4,
          photoPath: application.photoPath,
          idProofPath: application.idProofPath,
          districtId: application.districtId,
          assemblyId: application.assemblyId,
          mandalId: application.mandalId,
          panchayatId: application.panchayatId,
          applicationId: application.id,
        },
      });
      await tx.membershipApplication.update({
        where: { id: application.id },
        data: { status: "APPROVED", reviewedAt: new Date() },
      });
      return created;
    });

    res.json({ message: "Application approved and member created", member });
  } catch (err) {
    next(err);
  }
}

async function rejectApplication(req, res, next) {
  try {
    const { reason } = req.body;
    const application = await prisma.membershipApplication.findUnique({ where: { id: req.params.id } });
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "PENDING") {
      return res.status(400).json({ message: `Application already ${application.status.toLowerCase()}` });
    }

    const updated = await prisma.membershipApplication.update({
      where: { id: req.params.id },
      data: { status: "REJECTED", rejectionReason: reason || null, reviewedAt: new Date() },
    });
    res.json({ message: "Application rejected", application: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitApplication,
  getApplicationStatus,
  listApplications,
  getApplication,
  approveApplication,
  rejectApplication,
};
