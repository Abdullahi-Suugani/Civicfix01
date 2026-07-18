const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../utils/prisma");
const { signToken } = require("../utils/jwt");

function publicUser(user) {
  const { password, resetToken, resetTokenExp, ...rest } = user;
  return rest;
}

async function register(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required." });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, password: hashed, phone },
    });
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  // JWTs are stateless, so logout is handled client-side by discarding the
  // token. This endpoint exists for API completeness / future blacklisting.
  res.json({ message: "Logged out." });
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond with a generic message so we don't leak which emails
    // are registered.
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExp = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });
    // In production this would be emailed via SendGrid/SES/etc.
    console.log(`[CivicFix] Password reset token for ${email}: ${resetToken}`);
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gt: new Date() } },
    });
    if (!user) {
      return res.status(400).json({ message: "That reset link is invalid or has expired." });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExp: null },
    });
    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

module.exports = { register, login, logout, forgotPassword, resetPassword, me, publicUser };
