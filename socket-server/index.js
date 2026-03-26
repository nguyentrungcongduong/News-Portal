const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Configure CORS for Express routes + Socket.IO polling/websocket
const fallbackOrigins = [
  "https://news-portal-public-gray.vercel.app",
  "https://news-portal-admin-beta.vercel.app",
  "https://news-portal-web.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

const envOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = envOrigins.length > 0 ? envOrigins : fallbackOrigins;

const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow non-browser requests/health checks

  const normalizedOrigin = origin.trim().replace(/\/+$/, "");
  const exactMatch = allowedOrigins
    .map((url) => url.replace(/\/+$/, ""))
    .includes(normalizedOrigin);

  if (exactMatch) return true;

  // Allow preview/prod domains on Vercel and Render.
  return (
    /^https:\/\/.*\.vercel\.app\/?$/.test(normalizedOrigin) ||
    /^https:\/\/.*\.onrender\.com\/?$/.test(normalizedOrigin) ||
    /^http:\/\/localhost(:\d+)?\/?$/.test(normalizedOrigin) ||
    /^http:\/\/127\.0\.0\.1(:\d+)?\/?$/.test(normalizedOrigin)
  );
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  // Socket.IO uses its own CORS handling for the polling/XHR transport.
  // Use function-based origin check so it can reflect the requesting origin.
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_admin", () => {
    console.log(`Socket ${socket.id} joined channel: admin`);
    socket.join("admin");
  });

  socket.on("join_global", () => {
    console.log(`Socket ${socket.id} joined channel: global`);
    socket.join("global");
  });

  socket.on("join_user", (userId) => {
    console.log(`Socket ${socket.id} joined channel: user:${userId}`);
    socket.join(`user:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Health check for Render's probing and keep-alive
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/emit", (req, res) => {
  const { channel, event, data } = req.body;

  if (!channel || !event) {
    return res.status(400).json({ error: "Missing channel or event" });
  }

  console.log(`Emit to [${channel}] event [${event}]`, data);
  io.to(channel).emit(event, data);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
  console.log(`Allowed CORS origins:`, allowedOrigins);
});
