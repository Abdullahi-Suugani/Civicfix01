const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { reports: true } } },
      orderBy: { name: "asc" },
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required." });
    const category = await prisma.category.create({ data: { name, icon, color } });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, icon, color },
    });
    res.json({ category });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: "Category deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
