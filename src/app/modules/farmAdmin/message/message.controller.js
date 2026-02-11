import { MessageService } from "./message.service.js";
import { MessageService as CoreMessageService } from "../../farmManager/message/message.service.js";
import { getIO } from "../../../socket/index.js";

const getContacts = async (req, res) => {
  try {
    const contacts = await CoreMessageService.getContacts(
      req.user.farmId,
      req.user.id,
    );
    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOversightStats = async (req, res) => {
  try {
    const stats = await MessageService.getOversightStats(req.user.farmId);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOversightMessages = async (req, res) => {
  try {
    const messages = await MessageService.getOversightMessages(
      req.user.farmId,
      req.query,
    );
    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleMessagingStatus = async (req, res) => {
  try {
    const result = await MessageService.toggleMessagingStatus(req.user.farmId);
    return res.status(200).json({
      success: true,
      message: "Messaging status toggled",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const clearAllMessages = async (req, res) => {
  try {
    await MessageService.clearAllMessages(req.user.farmId);
    return res.status(200).json({
      success: true,
      message: "All messages cleared",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await MessageService.deleteMessage(req.params.messageId, req.user.farmId);
    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getInbox = async (req, res) => {
  try {
    const inbox = await MessageService.getInbox(req.user.id, req.user.farmId);
    return res.status(200).json({
      success: true,
      data: inbox,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await MessageService.getHistory(
      req.user.id,
      req.params.partnerId,
      req.user.farmId,
    );
    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOversightInbox = async (req, res) => {
  try {
    const inbox = await MessageService.getOversightInbox(
      req.user.farmId,
      req.query,
    );
    return res.status(200).json({
      success: true,
      data: inbox,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/messages/${req.file.filename}`;
    }

    const message = await MessageService.sendMessage({
      content,
      senderId: req.user.id,
      receiverId,
      farmId: req.user.farmId,
      imageUrl,
    });

    // Real-time notification
    try {
      const io = getIO();
      if (io) {
        io.to(`user_${receiverId}`).emit("new_message", message);
      }
    } catch (error) {
      console.error("SOCKET_EMIT_ERROR:", error.message);
    }

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const clearChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;
    await MessageService.clearChatHistory(
      req.user.id,
      partnerId,
      req.user.farmId,
    );
    return res.status(200).json({
      success: true,
      message: "Chat history cleared",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getThreadHistory = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;
    const history = await MessageService.getThreadHistory(
      req.user.farmId,
      user1Id,
      user2Id,
    );
    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const MessageController = {
  getContacts,
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
