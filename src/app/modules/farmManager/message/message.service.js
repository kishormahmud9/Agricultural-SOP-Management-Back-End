import prisma from "../../../prisma/client.js";

const createMessage = async ({ content, senderId, receiverId, farmId }) => {
  if (!content || !senderId || !receiverId || !farmId) {
    throw new Error("Missing required message fields");
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

export const MessageService = {
  createMessage,
  markMessagesAsRead,
};
