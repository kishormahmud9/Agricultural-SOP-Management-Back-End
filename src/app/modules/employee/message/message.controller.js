import { MessageService as SharedMessageService } from "../../farmManager/message/message.service.js";
import { MessageService } from "./message.service.js";

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

    const message = await SharedMessageService.createMessage({
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
  getConversation,
  sendMessage,
};
