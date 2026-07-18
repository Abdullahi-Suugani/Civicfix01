const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
const { requireAuth } = require("../middleware/auth");

// GET /api/notifications
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });
    res.json({ message: "Notification marked as read." });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/read-all
router.put("/read-all", requireAuth, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
