import { StatusCodes } from "http-status-codes";
import { FarmManagerAuthService } from "./auth.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { setAuthCookie } from "../../../utils/setCookie.js";

const loginFarmManager = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await FarmManagerAuthService.loginFarmManager(
      email,
      password,
    );

    // Set cookies
    setAuthCookie(res, result.tokens);

    sendResponse(res, {
      success: true,
      message: "Farm Manager logged in successfully",
      statusCode: StatusCodes.OK,
      data: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const FarmManagerAuthController = {
  loginFarmManager,

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Email is required",
          data: null,
        });
      }

      await FarmManagerAuthService.forgotPassword(email);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Forgot password OTP sent successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyForgotPasswordOtp(req, res, next) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Email and OTP are required",
          data: null,
        });
      }

      const resetToken = await FarmManagerAuthService.verifyForgotPasswordOtp(
        email,
        otp,
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "OTP verified successfully",
        data: { resetToken },
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { id } = req.user; // From auth middleware
      const { newPassword } = req.body;

      if (!newPassword) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "New password is required",
          data: null,
        });
      }

      await FarmManagerAuthService.resetPassword(id, newPassword);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Password reset successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { id } = req.user; // From auth middleware
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Current password and new password are required",
          data: null,
        });
      }

      await FarmManagerAuthService.changePassword(
        id,
        currentPassword,
        newPassword,
      );

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Password changed successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};
