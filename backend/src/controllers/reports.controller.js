const prisma = require("../utils/prisma");

function parseImages(report) {
  if (!report) return report;
  let images = [];
  try {
    images = JSON.parse(report.images || "[]");
  } catch (e) {
    images = [];
  }
  return { ...report, images };
}

// GET /api/reports
// Supports: search (title/description), category, status, priority,
// lat/lng+radius (for map bounds), sort, page, limit
async function listReports(req, res, next) {
  try {
    const {
      search,
      category,
      status,
      priority,
      userId,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }
    if (category) where.categoryId = category;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (userId) where.userId = userId;

    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" }
        : sort === "priority"
        ? { priority: "desc" }
        : { createdAt: "desc" };

    const take = Math.min(parseInt(limit, 10) || 12, 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy,
        take,
        skip,
        include: {
          category: true,
          user: { select: { id: true, fullName: true, avatar: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      reports: reports.map(parseImages),
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/:id
async function getReport(req, res, next) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        department: true,
        user: { select: { id: true, fullName: true, avatar: true } },
        comments: {
          include: { user: { select: { id: true, fullName: true, avatar: true } } },
          orderBy: { createdAt: "asc" },
        },
        timelineEvents: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!report) return res.status(404).json({ message: "Report not found." });
    res.json({ report: parseImages(report) });
  } catch (err) {
    next(err);
  }
}

// POST /api/reports
async function createReport(req, res, next) {
  try {
    const {
      title,
      description,
      categoryId,
      priority,
      latitude,
      longitude,
      address,
      isAnonymous,
    } = req.body;

    if (!title || !description || !categoryId || latitude == null || longitude == null) {
      return res.status(400).json({
        message: "Title, description, category, and location are required.",
      });
    }

    const uploadedFiles = (req.files || []).map((f) => `/uploads/${f.filename}`);

    const report = await prisma.report.create({
      data: {
        title,
        description,
        categoryId,
        priority: priority || "MEDIUM",
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        images: JSON.stringify(uploadedFiles),
        isAnonymous: isAnonymous === "true" || isAnonymous === true,
        userId: req.user.id,
        timelineEvents: { create: [{ status: "PENDING", note: "Report submitted." }] },
      },
      include: { category: true },
    });

    res.status(201).json({ report: parseImages(report) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/reports/:id
// Citizens can edit their own report only while it's still PENDING.
// Admins/moderators can update status, priority, and department at any time.
async function updateReport(req, res, next) {
  try {
    const existing = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Report not found." });

    const isOwner = existing.userId === req.user.id;
    const isStaff = ["ADMIN", "MODERATOR"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "You can't edit this report." });
    }
    if (isOwner && !isStaff && existing.status !== "PENDING") {
      return res.status(403).json({ message: "This report is already being reviewed and can no longer be edited." });
    }

    const data = {};
    if (isOwner || isStaff) {
      const { title, description, categoryId, latitude, longitude, address } = req.body;
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (categoryId !== undefined) data.categoryId = categoryId;
      if (latitude !== undefined) data.latitude = parseFloat(latitude);
      if (longitude !== undefined) data.longitude = parseFloat(longitude);
      if (address !== undefined) data.address = address;
    }

    let statusChanged = false;
    if (isStaff) {
      const { status, priority, departmentId } = req.body;
      if (status !== undefined && status !== existing.status) {
        data.status = status;
        statusChanged = true;
      }
      if (priority !== undefined) data.priority = priority;
      if (departmentId !== undefined) data.departmentId = departmentId;
    }

    if (req.files && req.files.length) {
      const uploadedFiles = req.files.map((f) => `/uploads/${f.filename}`);
      data.images = JSON.stringify(uploadedFiles);
    }

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(statusChanged && {
          timelineEvents: {
            create: [{ status: data.status, note: req.body.statusNote || `Status changed to ${data.status}.` }],
          },
        }),
      },
      include: { category: true },
    });

    if (statusChanged && existing.userId) {
      await prisma.notification.create({
        data: {
          userId: existing.userId,
          title: "Report status updated",
          message: `Your report "${existing.title}" is now ${data.status.replace("_", " ").toLowerCase()}.`,
        },
      });
    }

    res.json({ report: parseImages(report) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/reports/:id
async function deleteReport(req, res, next) {
  try {
    const existing = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Report not found." });

    const isOwner = existing.userId === req.user.id;
    const isStaff = ["ADMIN", "MODERATOR"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "You can't delete this report." });
    }
    if (isOwner && !isStaff && existing.status !== "PENDING") {
      return res.status(403).json({ message: "This report is already being reviewed and can no longer be deleted." });
    }

    await prisma.report.delete({ where: { id: req.params.id } });
    res.json({ message: "Report deleted." });
  } catch (err) {
    next(err);
  }
}

// POST /api/reports/:id/save  — toggle save/favorite
async function toggleSaveReport(req, res, next) {
  try {
    const existing = await prisma.savedReport.findUnique({
      where: { userId_reportId: { userId: req.user.id, reportId: req.params.id } },
    });
    if (existing) {
      await prisma.savedReport.delete({ where: { id: existing.id } });
      return res.json({ saved: false });
    }
    await prisma.savedReport.create({
      data: { userId: req.user.id, reportId: req.params.id },
    });
    res.json({ saved: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/mine/saved
async function listSavedReports(req, res, next) {
  try {
    const saved = await prisma.savedReport.findMany({
      where: { userId: req.user.id },
      include: { report: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ reports: saved.map((s) => parseImages(s.report)) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  toggleSaveReport,
  listSavedReports,
};
