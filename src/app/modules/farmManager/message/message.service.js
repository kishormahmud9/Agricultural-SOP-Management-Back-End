import prisma from "../../../prisma/client.js";
import { Role } from "../../../utils/role.js";

const createMessage = async ({ content, senderId, receiverId, farmId }) => {
  if (!content || !senderId || !receiverId || !farmId) {
    throw new Error("Missing required message fields");
  }

  // Fetch sender and receiver to check roles
  const [sender, receiver] = await Promise.all([
    prisma.user.findUnique({ where: { id: senderId } }),
    prisma.user.findUnique({ where: { id: receiverId } }),
  ]);

  if (!sender || !receiver) {
    throw new Error("Sender or receiver not found");
  }

  // 0. Check if messaging is enabled for the farm
  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    select: { isMessagingEnabled: true },
  });

  if (farm && !farm.isMessagingEnabled) {
    throw new Error("Messaging is currently disabled for this farm");
  }

  // Messaging path validation
  if (sender.role === Role.EMPLOYEE && receiver.role !== Role.MANAGER) {
    throw new Error("Employees can only message Farm Managers");
  }

  if (sender.role === Role.FARM_ADMIN && receiver.role !== Role.MANAGER) {
    throw new Error("Farm Admins can only message Farm Managers");
  }

  if (
    sender.role === Role.MANAGER &&
    receiver.role !== Role.FARM_ADMIN &&
    receiver.role !== Role.EMPLOYEE
  ) {
    throw new Error("Farm Managers can only message Farm Admins and Employees");
  }

  const message = await prisma.message.create({
    data: {
      content,
      senderId,
      receiverId,
      farmId,
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

  return message;
};

const markMessagesAsRead = async ({ senderId, receiverId, farmId }) => {
  if (!senderId || !receiverId || !farmId) {
    throw new Error("Missing required fields");
  }

  await prisma.message.updateMany({
    where: {
      senderId,
      receiverId,
      farmId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  // return unread count for receiver
  const unreadCount = await prisma.message.count({
    where: {
      receiverId,
      farmId,
      isRead: false,
    },
  });

  return unreadCount;
};

const getInbox = async ({ farmId, userId }) => {
  try {
    if (!farmId || !userId) {
      return [];
    }

    /**
     * Step 1: Fetch all messages where
     * user is sender OR receiver
     */
    const messages = await prisma.message.findMany({
      where: {
        farmId,
        OR: [{ senderId: userId }, { receiverId: userId }],
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
     * Step 2: Group by conversation partner
     */
    const conversationsMap = new Map();

    for (const msg of messages) {
      const isSender = msg.senderId === userId;
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

      // Count unread messages
      if (msg.receiverId === userId && msg.isRead === false) {
        conversationsMap.get(otherUser.id).unreadCount += 1;
      }
    }

    /**
     * Step 3: Return sorted list
     */
    return Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
    );
  } catch (error) {
    console.error("GET_INBOX_SERVICE_ERROR:", error.message);
    return [];
  }
};

const getContacts = async (farmId, currentUserId) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    });

    if (!currentUser) return [];

    let roleFilter = [];
    if (currentUser.role === Role.EMPLOYEE) {
      roleFilter = [Role.MANAGER];
    } else if (currentUser.role === Role.FARM_ADMIN) {
      roleFilter = [Role.MANAGER];
    } else if (currentUser.role === Role.MANAGER) {
      roleFilter = [Role.FARM_ADMIN, Role.EMPLOYEE];
    } else {
      return []; // SYSTEM_OWNER etc.
    }

    const contacts = await prisma.user.findMany({
      where: {
        farmId,
        id: { not: currentUserId },
        role: { in: roleFilter },
      },
      select: {
        id: true,
        name: true,
        jobTitle: true,
        role: true,
        avatarUrl: true,
      },
    });

    return contacts;
  } catch (error) {
    console.error("GET_CONTACTS_SERVICE_ERROR:", error.message);
    return [];
  }
};

const getChatHistory = async ({ farmId, userId, partnerId }) => {
  try {
    if (!farmId || !userId || !partnerId) {
      return [];
    }

    const messages = await prisma.message.findMany({
      where: {
        farmId,
        OR: [
          {
            senderId: userId,
            receiverId: partnerId,
          },
          {
            senderId: partnerId,
            receiverId: userId,
          },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      isMine: msg.senderId === userId,
      createdAt: msg.createdAt,
    }));
  } catch (error) {
    console.error("GET_CHAT_HISTORY_SERVICE_ERROR:", error.message);
    return [];
  }
};

export const MessageService = {
  createMessage,
  markMessagesAsRead,
  getInbox,
  getContacts,
  getChatHistory,
};
