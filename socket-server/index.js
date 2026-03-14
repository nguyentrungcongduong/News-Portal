const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : "*",
    methods: ["GET", "POST"],
    credentials: true,
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
});
