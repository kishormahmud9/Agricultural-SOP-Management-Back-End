import prisma from "../../../prisma/client.js";
import { Role } from "../../../utils/role.js";
import { MessageService as CoreMessageService } from "../../farmManager/message/message.service.js";

const getOversightStats = async (farmId) => {
  try {
    const totalMessages = await prisma.message.count({
      where: { farmId },
    });

    const unreadMessagesCount = await prisma.message.count({
      where: {
        farmId,
        isRead: false,
      },
    });

    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      select: { isMessagingEnabled: true },
    });

    return {
      totalMessages,
      unreadMessagesCount, // Note: This is an oversight view of all unread messages in the farm
      isMessagingEnabled: farm?.isMessagingEnabled ?? true,
    };
  } catch (error) {
    console.error("GET_OVERSIGHT_STATS_ERROR:", error.message);
    throw error;
  }
};

const getOversightMessages = async (farmId, query) => {
  try {
    const { search } = query;

    const messages = await prisma.message.findMany({
      where: {
        farmId,
        ...(search
          ? {
            OR: [
              { content: { contains: search, mode: "insensitive" } },
              {
                sender: { name: { contains: search, mode: "insensitive" } },
              },
              {
                receiver: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
          : {}),
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return messages.map((m) => ({
      id: m.id,
      content: m.content,
      isRead: m.isRead,
      createdAt: m.createdAt,
      sender: {
        id: m.sender.id,
        name: m.sender.name,
        role: m.sender.role,
      },
      receiver: {
        id: m.receiver.id,
        name: m.receiver.name,
        role: m.receiver.role,
      },
    }));
  } catch (error) {
    console.error("GET_OVERSIGHT_MESSAGES_ERROR:", error.message);
    throw error;
  }
};

const toggleMessagingStatus = async (farmId) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      select: { isMessagingEnabled: true },
    });

    const updatedFarm = await prisma.farm.update({
      where: { id: farmId },
      data: { isMessagingEnabled: !farm.isMessagingEnabled },
      select: { isMessagingEnabled: true },
    });

    return updatedFarm;
  } catch (error) {
    console.error("TOGGLE_MESSAGING_STATUS_ERROR:", error.message);
    throw error;
  }
};

const clearAllMessages = async (farmId) => {
  try {
    await prisma.message.deleteMany({
      where: { farmId },
    });
    return true;
  } catch (error) {
    console.error("CLEAR_ALL_MESSAGES_ERROR:", error.message);
    throw error;
  }
};

const deleteMessage = async (messageId, farmId) => {
  try {
    await prisma.message.delete({
      where: {
        id: messageId,
        farmId, // Ensure it belongs to the admin's farm
      },
    });
    return true;
  } catch (error) {
    console.error("DELETE_MESSAGE_ERROR:", error.message);
    throw error;
  }
};

const getInbox = async (adminId, farmId) => {
  try {
    // Farm Admin can message Managers
    const messages = await prisma.message.findMany({
      where: {
        farmId,
        OR: [{ senderId: adminId }, { receiverId: adminId }],
      },
      include: {
        sender: { select: { id: true, name: true, jobTitle: true } },
        receiver: { select: { id: true, name: true, jobTitle: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const conversationMap = new Map();

    for (const msg of messages) {
      const otherUser = msg.senderId === adminId ? msg.receiver : msg.sender;
      if (!otherUser) continue;

      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          userId: otherUser.id,
          name: otherUser.name,
          jobTitle: otherUser.jobTitle ?? "—",
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: msg.receiverId === adminId && !msg.isRead ? 1 : 0,
        });
      } else if (msg.receiverId === adminId && !msg.isRead) {
        conversationMap.get(otherUser.id).unreadCount += 1;
      }
    }

    return Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
    );
  } catch (error) {
    console.error("ADMIN_GET_INBOX_ERROR:", error.message);
    throw error;
  }
};

const getHistory = async (adminId, partnerId, farmId) => {
  try {
    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        farmId,
        senderId: partnerId,
        receiverId: adminId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return await prisma.message.findMany({
      where: {
        farmId,
        OR: [
          { senderId: adminId, receiverId: partnerId },
          { senderId: partnerId, receiverId: adminId },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        senderId: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("ADMIN_GET_HISTORY_ERROR:", error.message);
    throw error;
  }
};

const sendMessage = async ({ content, senderId, receiverId, farmId, imageUrl }) => {
  return await CoreMessageService.createMessage({
    content,
    senderId,
    receiverId,
    farmId,
    imageUrl,
  });
};

const clearChatHistory = async (adminId, partnerId, farmId) => {
  try {
    await prisma.message.deleteMany({
      where: {
        farmId,
        OR: [
          { senderId: adminId, receiverId: partnerId },
          { senderId: partnerId, receiverId: adminId },
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("CLEAR_CHAT_HISTORY_ERROR:", error.message);
    throw error;
  }
};

const getOversightInbox = async (farmId, query) => {
  try {
    const { search } = query;

    // Fetch all messages in the farm
    const messages = await prisma.message.findMany({
      where: {
        farmId,
        ...(search
          ? {
            OR: [
              { content: { contains: search, mode: "insensitive" } },
              { sender: { name: { contains: search, mode: "insensitive" } } },
              {
                receiver: { name: { contains: search, mode: "insensitive" } },
              },
            ],
          }
          : {}),
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
        receiver: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const threadMap = new Map();

    for (const msg of messages) {
      // Create a unique key for the pair (sorted IDs)
      const threadKey = [msg.senderId, msg.receiverId].sort().join("_");

      if (!threadMap.has(threadKey)) {
        // For the oversight inbox, we often want to prioritize the Employee's name as the thread title
        // since the admin is monitoring "Employee Messages"
        const employee =
          msg.sender.role === Role.EMPLOYEE
            ? msg.sender
            : msg.receiver.role === Role.EMPLOYEE
              ? msg.receiver
              : null;
        const manager =
          msg.sender.role === Role.MANAGER
            ? msg.sender
            : msg.receiver.role === Role.MANAGER
              ? msg.receiver
              : null;

        // Use the employee if found, otherwise use whichever is not the Admin (though Oversight excludes admin usually)
        const primaryUser = employee || manager || msg.sender;

        threadMap.set(threadKey, {
          threadId: threadKey,
          userId: primaryUser.id,
          name: primaryUser.name,
          role: primaryUser.role,
          avatarUrl: primaryUser.avatarUrl,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          isUnreadInThread: !msg.isRead, // If the last message is unread
        });
      }
    }

    return Array.from(threadMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
    );
  } catch (error) {
    console.error("GET_OVERSIGHT_INBOX_ERROR:", error.message);
    throw error;
  }
};

const getThreadHistory = async (farmId, user1Id, user2Id) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        farmId,
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return messages.map((m) => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderRole: m.sender.role,
      createdAt: m.createdAt,
    }));
  } catch (error) {
    console.error("GET_THREAD_HISTORY_ERROR:", error.message);
    throw error;
  }
};

export const MessageService = {
  getOversightStats,
  getOversightMessages,
  getOversightInbox,
  getThreadHistory,
  toggleMessagingStatus,
  clearAllMessages,
  deleteMessage,
  getInbox,
  getHistory,
  sendMessage,
  clearChatHistory,
};
