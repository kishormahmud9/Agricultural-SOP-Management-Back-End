import prisma from "../../../prisma/client.js";

const getInbox = async (employeeId, farmId) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        receiverId: employeeId,
        farmId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        content: true,
        isRead: true,
        createdAt: true,
        senderId: true,
      },
    });

    const map = new Map();

    for (const msg of messages) {
      if (!map.has(msg.senderId)) {
        map.set(msg.senderId, {
          senderId: msg.senderId,
          lastMessage: msg.content,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
        });
      }
    }

    return Array.from(map.values());
  } catch (error) {
    console.error("INBOX_SERVICE_ERROR:", error);
    return [];
  }
};

const getConversation = async ({ employeeId, otherUserId, farmId }) => {
  try {
    return await prisma.message.findMany({
      where: {
        farmId,
        OR: [
          {
            senderId: employeeId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: employeeId,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        content: true,
        senderId: true,
        receiverId: true,
        isRead: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("CONVERSATION_SERVICE_ERROR:", error.message);
    return [];
  }
};

export const MessageService = {
  getInbox,
  getConversation,
};
