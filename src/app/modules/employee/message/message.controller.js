import { MessageService } from "./message.service.js";

const getInbox = async (req, res) => {
  try {
    const { employeeId, farmId } = req.query;

    if (!employeeId || !farmId) {
      return res.status(200).json({
        success: false,
        message: "employeeId and farmId are required",
        data: [],
      });
    }

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
    const { employeeId, farmId } = req.query;

    if (!employeeId || !farmId || !otherUserId) {
      return res.status(200).json({
        success: false,
        message: "employeeId, farmId and otherUserId are required",
        data: [],
      });
    }

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

export const MessageController = {
  getInbox,
  getConversation,
};
