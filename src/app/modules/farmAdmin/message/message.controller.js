import { MessageService } from "./message.service.js";

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
    const message = await MessageService.sendMessage({
      content,
      senderId: req.user.id,
      receiverId,
      farmId: req.user.farmId,
    });
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

export const MessageController = {
  getOversightStats,
  getOversightMessages,
  getOversightInbox,
  toggleMessagingStatus,
  clearAllMessages,
  deleteMessage,
  getInbox,
  getHistory,
  sendMessage,
  clearChatHistory,
};
