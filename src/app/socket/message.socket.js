import { MessageService } from "../modules/farmManager/message/message.service.js";
import { getIO } from "./index.js";

export const registerMessageSocket = (socket) => {
  /**
   * =========================
   * SEND MESSAGE
   * =========================
   */
  socket.on("send_message", async (payload) => {
    try {
      const { content, receiverId } = payload;
      const senderId = socket.data.userId;
      const farmId = socket.data.farmId;

      if (!senderId || !farmId) {
        socket.emit("error_message", {
          message: "User not joined to farm",
        });
        return;
      }

      if (!content || !receiverId) {
        socket.emit("error_message", {
          message: "Invalid message payload",
        });
        return;
      }

      const message = await MessageService.createMessage({
        content,
        senderId,
        receiverId,
        farmId,
      });

      const io = getIO();

      // 🔥 Emit message to all users in the farm (receiver will pick it)
      io.to(`farm_${farmId}`).emit("new_message", {
        id: message.id,
        content: message.content,
        sender: message.sender,
        receiverId: message.receiverId,
        createdAt: message.createdAt,
        isRead: message.isRead,
      });
    } catch (error) {
      console.error("SEND_MESSAGE_ERROR:", error.message);

      socket.emit("error_message", {
        message: error.message || "Failed to send message",
      });
    }
  });

  /**
   * =========================
   * MARK MESSAGES AS READ
   * =========================
   */
  socket.on("mark_read", async ({ senderId }) => {
    try {
      const receiverId = socket.data.userId;
      const farmId = socket.data.farmId;

      if (!senderId || !receiverId || !farmId) {
        socket.emit("error_message", {
          message: "Invalid mark read request",
        });
        return;
      }

      const unreadCount = await MessageService.markMessagesAsRead({
        senderId,
        receiverId,
        farmId,
      });

      const io = getIO();

      // 🔔 Update unread count for receiver (real-time)
      io.to(`farm_${farmId}`).emit("unread_update", {
        userId: receiverId,
        unreadCount,
      });
    } catch (error) {
      console.error("MARK_READ_ERROR:", error.message);

      socket.emit("error_message", {
        message: error.message || "Failed to mark messages as read",
      });
    }
  });
};
