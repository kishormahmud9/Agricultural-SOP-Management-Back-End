import prisma from "../../../prisma/client.js";

const getInbox = async (employeeId, farmId) => {
  try {
    /**
     * Fetch all messages where
     * employee is sender OR receiver
     */
    const messages = await prisma.message.findMany({
      where: {
        farmId,
        OR: [{ senderId: employeeId }, { receiverId: employeeId }],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sender: {
          select: { id: true, name: true, jobTitle: true },
        },
        receiver: {
          select: { id: true, name: true, jobTitle: true },
        },
      },
    });

    /**
     * Group by conversation partner
     */
    const conversationsMap = new Map();

    for (const msg of messages) {
      const isSender = msg.senderId === employeeId;
      const otherUser = isSender ? msg.receiver : msg.sender;

      if (!otherUser) continue;

      if (!conversationsMap.has(otherUser.id)) {
        conversationsMap.set(otherUser.id, {
          userId: otherUser.id,
          name: otherUser.name,
          jobTitle: otherUser.jobTitle ?? "—",
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread messages (where employee is receiver)
      if (msg.receiverId === employeeId && msg.isRead === false) {
        conversationsMap.get(otherUser.id).unreadCount += 1;
      }
    }

    return Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
    );
  } catch (error) {
    console.error("INBOX_SERVICE_ERROR:", error.message);
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
