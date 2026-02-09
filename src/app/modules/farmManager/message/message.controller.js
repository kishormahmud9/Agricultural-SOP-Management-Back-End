import { MessageService } from "./message.service.js";

const getInbox = async (req, res) => {
  try {
    const conversations = await MessageService.getInbox({
      farmId: req.user.farmId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("GET_INBOX_CONTROLLER_ERROR:", error.message);

    return res.status(200).json({
      success: false,
      message: "Failed to load inbox",
      data: [],
    });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await MessageService.getContacts(
      req.user.farmId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("GET_CONTACTS_CONTROLLER_ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: "Failed to load contacts",
      data: [],
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const messages = await MessageService.getChatHistory({
      farmId: req.user.farmId,
      userId: req.user.id,
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

const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    const { id: senderId, farmId } = req.user;

    const message = await MessageService.createMessage({
      content,
      senderId,
      receiverId,
      farmId,
    });

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("SEND_MESSAGE_CONTROLLER_ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const MessageController = {
  getInbox,
  getContacts,
  getChatHistory,
  sendMessage,
};
