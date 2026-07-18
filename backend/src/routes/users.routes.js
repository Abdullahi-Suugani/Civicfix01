const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");
const { publicUser } = require("../controllers/auth.controller");

// GET /api/users — admin only, list + search
router.get("/", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role) where.role = role;

    const take = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { reports: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map(publicUser),
      pagination: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) || 1 },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id — self can update profile; admin can update anyone incl. role
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const isSelf = req.user.id === req.params.id;
    const isAdmin = req.user.role === "ADMIN";
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: "You can't edit this user." });
    }

    const data = {};
    const { fullName, phone, address, avatar, password, role } = req.body;
    if (fullName !== undefined) data.fullName = fullName;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (avatar !== undefined) data.avatar = avatar;
    if (password) data.password = await bcrypt.hash(password, 10);
    if (role !== undefined && isAdmin) data.role = role;

    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id — admin only
router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
