import { StatusCodes } from "http-status-codes";
import { FarmAdminAuthService } from "./auth.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { setAuthCookie } from "../../../utils/setCookie.js";
import { OtpService } from "../../otp/otp.service.js";
import prisma from "../../../prisma/client.js";

const registerFarmAdmin = async (req, res, next) => {
  try {
    const result = await FarmAdminAuthService.registerFarmAdmin(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Farm Admin registered successfully. Please verify your email.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyRegistrationOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    await OtpService.verifyOtp(prisma, email, otp);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Account verified successfully. You can now login.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const loginFarmAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await FarmAdminAuthService.loginFarmAdmin(email, password);

    // Set cookies
    setAuthCookie(res, result.tokens);

    sendResponse(res, {
      success: true,
      message: "Farm Admin logged in successfully",
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

export const FarmAdminAuthController = {
  loginFarmAdmin,
  registerFarmAdmin,
  verifyRegistrationOtp,
  async resendOtp(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) throw new DevBuildError("Email is required", StatusCodes.BAD_REQUEST);

      await OtpService.sendOtp(prisma, email);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Verification OTP resent successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

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

      await FarmAdminAuthService.forgotPassword(email);

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

      const resetToken = await FarmAdminAuthService.verifyForgotPasswordOtp(
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

      await FarmAdminAuthService.resetPassword(id, newPassword);

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

      await FarmAdminAuthService.changePassword(
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
