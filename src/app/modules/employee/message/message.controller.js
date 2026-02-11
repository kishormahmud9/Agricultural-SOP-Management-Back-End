import { MessageService as SharedMessageService } from "../../farmManager/message/message.service.js";
import { MessageService } from "./message.service.js";
import { getIO } from "../../../socket/index.js";

const getInbox = async (req, res) => {
  try {
    const { id: employeeId, farmId } = req.user;

    const inbox = await MessageService.getInbox(employeeId, farmId);

    return res.status(200).json({
      success: true,
      data: inbox,
    });
  } catch (error) {
    console.error("EMPLOYEE_INBOX_ERROR:", error.message);

    return res.status(200).json({
      success: false,
      message: "Failed to load inbox",
      data: [],
    });
  }
};

const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const { id: employeeId, farmId } = req.user;

    const messages = await MessageService.getConversation({
      employeeId,
      otherUserId,
      farmId,
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("GET_CONVERSATION_ERROR:", error.message);

    return res.status(200).json({
      success: false,
      message: "Failed to load conversation",
      data: [],
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    const { id: senderId, farmId } = req.user;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/messages/${req.file.filename}`;
    }

    const message = await SharedMessageService.createMessage({
      content,
      senderId,
      receiverId,
      farmId,
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
    console.error("SEND_MESSAGE_CONTROLLER_ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getContacts = async (req, res, next) => {
  try {
    const { id: userId, farmId } = req.user;
    const contacts = await SharedMessageService.getContacts(farmId, userId);

    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const MessageController = {
  getInbox,
  getConversation,
  sendMessage,
  getContacts,
};
