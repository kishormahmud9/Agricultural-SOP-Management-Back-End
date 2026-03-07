import { PaymentService } from "./payment.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

const createCheckout = async (req, res, next) => {
  try {
    const user = req.user;
    const checkoutUrl = await PaymentService.createCheckoutSession(user, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Checkout session created successfully",
      data: { url: checkoutUrl },
    });
  } catch (error) {
    next(error);
  }
};

const handleStripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    const result = await PaymentService.handleWebhook(sig, req.rawBody);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const PaymentController = {
  createCheckout,
  handleStripeWebhook,
};
