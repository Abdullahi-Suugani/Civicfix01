const { verifyToken } = require("../utils/jwt");
const prisma = require("../utils/prisma");

// Verifies the Bearer token and attaches the current user to req.user.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// Restricts a route to one or more roles, e.g. requireRole("ADMIN")
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You don't have permission to do that." });
    }
    next();
  };
}

// Attaches req.user if a valid token is present, but does not fail if absent.
// Useful for routes like GET /reports that behave slightly differently for
// logged-in users (e.g. showing "saved" state) without requiring login.
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return next();
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (user) req.user = user;
    next();
  } catch (err) {
    next();
  }
}

module.exports = { requireAuth, requireRole, optionalAuth };
