require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("./prisma");

const CATEGORIES = [
  { name: "Roads", icon: "road", color: "#2563EB" },
  { name: "Street Lights", icon: "lightbulb", color: "#F59E0B" },
  { name: "Garbage Collection", icon: "trash", color: "#65A30D" },
  { name: "Water Supply", icon: "droplet", color: "#0891B2" },
  { name: "Drainage", icon: "waves", color: "#0369A1" },
  { name: "Flooding", icon: "cloud-rain", color: "#1D4ED8" },
  { name: "Electricity", icon: "zap", color: "#CA8A04" },
  { name: "Public Safety", icon: "shield", color: "#DC2626" },
  { name: "Environment", icon: "leaf", color: "#16A34A" },
  { name: "Parks", icon: "tree", color: "#15803D" },
  { name: "Buildings", icon: "building", color: "#6B7280" },
  { name: "Traffic Signs", icon: "sign", color: "#EA580C" },
  { name: "Other", icon: "more-horizontal", color: "#6B7280" },
];

async function main() {
  console.log("Seeding categories...");
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log("Seeding admin + demo citizen...");
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@civicfix.gov" },
    update: {},
    create: {
      fullName: "CivicFix Admin",
      email: "admin@civicfix.gov",
      password: adminPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });

  const citizenPassword = await bcrypt.hash("Citizen123!", 10);
  const citizen = await prisma.user.upsert({
    where: { email: "citizen@example.com" },
    update: {},
    create: {
      fullName: "Amina Yusuf",
      email: "citizen@example.com",
      password: citizenPassword,
      role: "CITIZEN",
      isVerified: true,
      address: "Mogadishu, Somalia",
    },
  });

  const roads = await prisma.category.findUnique({ where: { name: "Roads" } });
  const streetLights = await prisma.category.findUnique({ where: { name: "Street Lights" } });
  const garbage = await prisma.category.findUnique({ where: { name: "Garbage Collection" } });

  const existingReports = await prisma.report.count();
  if (existingReports === 0) {
    console.log("Seeding sample reports...");
    await prisma.report.create({
      data: {
        title: "Large pothole on Maka Al Mukarama Road",
        description: "A deep pothole has formed near the junction, causing traffic to swerve dangerously.",
        categoryId: roads.id,
        priority: "HIGH",
        status: "PENDING",
        latitude: 2.0469,
        longitude: 45.3182,
        address: "Maka Al Mukarama Road, Mogadishu",
        images: JSON.stringify([]),
        userId: citizen.id,
        timelineEvents: { create: [{ status: "PENDING", note: "Report submitted." }] },
      },
    });
    await prisma.report.create({
      data: {
        title: "Broken streetlight near market",
        description: "The streetlight has been out for two weeks, making the area unsafe at night.",
        categoryId: streetLights.id,
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        latitude: 2.0400,
        longitude: 45.3100,
        address: "Bakaara Market area, Mogadishu",
        images: JSON.stringify([]),
        userId: citizen.id,
        timelineEvents: {
          create: [
            { status: "PENDING", note: "Report submitted." },
            { status: "IN_PROGRESS", note: "Maintenance crew assigned." },
          ],
        },
      },
    });
    await prisma.report.create({
      data: {
        title: "Overflowing garbage bins on 21st Street",
        description: "Bins have not been collected in over a week and are overflowing onto the sidewalk.",
        categoryId: garbage.id,
        priority: "LOW",
        status: "RESOLVED",
        latitude: 2.0350,
        longitude: 45.3400,
        address: "21st Street, Mogadishu",
        images: JSON.stringify([]),
        userId: citizen.id,
        timelineEvents: {
          create: [
            { status: "PENDING", note: "Report submitted." },
            { status: "RESOLVED", note: "Bins collected and schedule corrected." },
          ],
        },
      },
    });
  }

  console.log("Done. Demo logins:");
  console.log("  Admin:   admin@civicfix.gov / Admin123!");
  console.log("  Citizen: citizen@example.com / Citizen123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
