require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ---------- Admin ----------
  const adminPhone = process.env.ADMIN_PHONE || "9999999999";
  const adminName = process.env.ADMIN_NAME || "Super Admin";
  await prisma.admin.upsert({
    where: { phone: adminPhone },
    update: { role: "SUPER_ADMIN", isActive: true },
    create: { phone: adminPhone, name: adminName, role: "SUPER_ADMIN" },
  });
  console.log(`Super Admin ready: ${adminName} (${adminPhone})`);

  // ---------- Organizational hierarchy (sample) ----------
  const state = await prisma.state.upsert({
    where: { name: "Karnataka" },
    update: {},
    create: { name: "Karnataka" },
  });

  const district = await prisma.district.upsert({
    where: { name_stateId: { name: "Bengaluru Urban", stateId: state.id } },
    update: {},
    create: { name: "Bengaluru Urban", stateId: state.id },
  });

  const assembly = await prisma.assembly.upsert({
    where: { name_districtId: { name: "Malleshwaram", districtId: district.id } },
    update: {},
    create: { name: "Malleshwaram", districtId: district.id },
  });

  const mandal = await prisma.mandal.upsert({
    where: { name_assemblyId: { name: "Mandal 1", assemblyId: assembly.id } },
    update: {},
    create: { name: "Mandal 1", assemblyId: assembly.id },
  });

  await prisma.villagePanchayat.upsert({
    where: { name_mandalId: { name: "Panchayat 1", mandalId: mandal.id } },
    update: {},
    create: { name: "Panchayat 1", mandalId: mandal.id },
  });

  console.log("Sample organizational hierarchy created (Karnataka > Bengaluru Urban > Malleshwaram > Mandal 1 > Panchayat 1)");

  // ---------- Departments ----------
  const departmentTitles = [
    "Chairman",
    "Co-Chairman",
    "Editor",
    "Associate Editor",
    "Board President",
    "Gram Panchayat Coordinator",
  ];
  for (const title of departmentTitles) {
    await prisma.department.upsert({ where: { title }, update: {}, create: { title } });
  }
  console.log("Departments seeded");

  // ---------- Home content placeholders ----------
  const sections = [
    { section: "HERO", heading: "Bharatiya Hindu Shakti Foundation", body: "Serving society, strengthening culture." },
    { section: "ABOUT", heading: "About Us", body: "Add details about the organization here." },
    { section: "OBJECTIVES", heading: "Our Objectives & Goals", body: "Add objectives and goals here." },
    { section: "CONTACT", heading: "Contact Us", body: "Add contact details here." },
  ];
  for (const s of sections) {
    await prisma.homeContent.upsert({ where: { section: s.section }, update: {}, create: s });
  }
  console.log("Home content placeholders seeded");

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
