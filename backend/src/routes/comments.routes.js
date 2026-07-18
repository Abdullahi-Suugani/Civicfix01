const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
const { requireAuth } = require("../middleware/auth");

// GET /api/comments?reportId=...
router.get("/", async (req, res, next) => {
  try {
    const { reportId } = req.query;
    if (!reportId) return res.status(400).json({ message: "reportId is required." });
    const comments = await prisma.comment.findMany({
      where: { reportId },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json({ comments });
  } catch (err) {
    next(err);
  }
});

// POST /api/comments
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { reportId, comment } = req.body;
    if (!reportId || !comment) {
      return res.status(400).json({ message: "reportId and comment text are required." });
    }
    const created = await prisma.comment.create({
      data: { reportId, comment, userId: req.user.id },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
    });

    // Notify the report owner (if it's not their own comment)
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (report && report.userId && report.userId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: report.userId,
          title: "New comment on your report",
          message: `${req.user.fullName} commented on "${report.title}".`,
        },
      });
    }

    res.status(201).json({ comment: created });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Comment not found." });
    const isOwner = existing.userId === req.user.id;
    const isStaff = ["ADMIN", "MODERATOR"].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "You can't delete this comment." });
    }
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ message: "Comment deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
