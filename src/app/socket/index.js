import { Server } from "socket.io";
import { registerMessageSocket } from "./message.socket.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // mobile app / frontend later restrict
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join", ({ userId, farmId, role }) => {
      if (!userId || !farmId) return;

      socket.join(`farm_${farmId}`);
      socket.join(`user_${userId}`);

      // Admins join a special room to oversee ALL messages in real-time
      if (role === "FARM_ADMIN") {
        socket.join(`farm_${farmId}_admins`);
      }

      socket.data.userId = userId;
      socket.data.farmId = farmId;
      socket.data.role = role;

      console.log(`👤 User ${userId} joined farm_${farmId} (Room: user_${userId})`);
    });

    // 🔥 REGISTER MESSAGE EVENTS
    registerMessageSocket(socket);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
