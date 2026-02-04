import { MessageService } from "./message.service.js";

const getConversations = async (req, res) => {
  try {
    const { farmId, userId } = req.query;

    if (!farmId || !userId) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const conversations = await MessageService.getConversations({
      farmId,
      userId,
    });

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("GET_CONVERSATIONS_CONTROLLER_ERROR:", error.message);

    return res.status(200).json({
      success: false,
      message: "Failed to load conversations",
      data: [],
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { farmId, userId, partnerId } = req.query;

    const messages = await MessageService.getChatHistory({
      farmId,
      userId,
      partnerId,
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("GET_CHAT_HISTORY_CONTROLLER_ERROR:", error.message);

    return res.status(200).json({
      success: false,
      data: [],
      message: "Failed to load chat history",
    });
  }
};

export const MessageController = {
  getConversations,
  getChatHistory,
};
