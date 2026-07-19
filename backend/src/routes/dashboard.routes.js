const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/dashboard/statistics — admin analytics
router.get("/statistics", requireAuth, requireRole("ADMIN", "MODERATOR"), async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalReports,
      pendingReports,
      resolvedReports,
      totalUsers,
      totalCategories,
      newToday,
      byCategory,
      byStatus,
      byAiCategory,
      recentReports,
      highPriorityReports,
      recentUsers,
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.user.count({ where: { role: "CITIZEN" } }),
      prisma.category.count(),
      prisma.report.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.report.groupBy({ by: ["categoryId"], _count: { _all: true } }),
      prisma.report.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.report.groupBy({
        by: ["aiCategory"],
        where: { aiCategory: { not: null } },
        _count: { _all: true },
      }),
      prisma.report.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { category: true, user: { select: { fullName: true } } },
      }),
      prisma.report.findMany({
        take: 8,
        where: {
          OR: [{ priority: { in: ["HIGH", "CRITICAL"] } }, { aiPriority: { in: ["HIGH", "CRITICAL"] } }],
        },
        orderBy: { createdAt: "desc" },
        include: { category: true, user: { select: { fullName: true } } },
      }),
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: { id: true, fullName: true, email: true, role: true, createdAt: true },
      }),
    ]);

    // Reports by month (last 6 months), computed in JS for SQLite portability
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentForMonthly = await prisma.report.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true },
    });

    const monthly = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      monthly[key] = 0;
    }
    recentForMonthly.forEach((r) => {
      const key = r.createdAt.toLocaleString("en-US", { month: "short", year: "2-digit" });
      if (key in monthly) monthly[key] += 1;
    });

    // Category names for the groupBy result
    const categories = await prisma.category.findMany();
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

    res.json({
      cards: {
        totalReports,
        pendingReports,
        resolvedReports,
        activeUsers: totalUsers,
        totalCategories,
        newReportsToday: newToday,
      },
      charts: {
        reportsByCategory: byCategory.map((c) => ({
          category: categoryMap[c.categoryId] || "Unknown",
          count: c._count._all,
        })),
        reportsByStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
        reportsByAiCategory: byAiCategory.map((c) => ({
          category: c.aiCategory || "Unknown",
          count: c._count._all,
        })),
        reportsByMonth: Object.entries(monthly).map(([month, count]) => ({ month, count })),
        resolutionRate: totalReports ? Math.round((resolvedReports / totalReports) * 100) : 0,
      },
      tables: {
        recentReports,
        highPriorityReports,
        recentUsers,
      },
      ai: {
        summaries: recentReports.filter((r) => r.aiSummary).map((r) => ({
          id: r.id,
          title: r.title,
          summary: r.aiSummary,
        })),
        recommendations: highPriorityReports.filter((r) => r.aiRecommendation).map((r) => ({
          id: r.id,
          title: r.title,
          priority: r.aiPriority || r.priority,
          recommendation: r.aiRecommendation,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

