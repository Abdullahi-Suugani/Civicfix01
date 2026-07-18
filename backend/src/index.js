require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { Server } = require("socket.io");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const reportRoutes = require("./routes/reports.routes");
const categoryRoutes = require("./routes/categories.routes");
const commentRoutes = require("./routes/comments.routes");
const notificationRoutes = require("./routes/notifications.routes");
const userRoutes = require("./routes/users.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*" },
});

// Make io available to route handlers via req.app.get("io") if needed later
app.set("io", io);

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

// Basic real-time wiring: clients join a room per report to get live
// comment/status updates. Emitting to these rooms from controllers is left
// as a clean extension point (see README "Real-time" section).
io.on("connection", (socket) => {
  socket.on("join:report", (reportId) => socket.join(`report:${reportId}`));
  socket.on("leave:report", (reportId) => socket.leave(`report:${reportId}`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`CivicFix API listening on http://localhost:${PORT}`);
});
