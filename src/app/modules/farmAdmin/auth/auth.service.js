import prisma from "../../../prisma/client.js";
import bcrypt from "bcrypt";
import DevBuildError from "../../../lib/DevBuildError.js";
import { StatusCodes } from "http-status-codes";
import { createUserTokens } from "../../../utils/userTokenGenerator.js";
import { OtpService } from "../../otp/otp.service.js";
import { Role } from "../../../utils/role.js";

const loginFarmAdmin = async (email, password) => {
  // 1. Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new DevBuildError("User does not exist", StatusCodes.NOT_FOUND);
  }

  // 2. Check if user has FARM_ADMIN role
  if (user.role !== Role.FARM_ADMIN) {
    throw new DevBuildError("Unauthorized access", StatusCodes.FORBIDDEN);
  }

  // 3. Verify password
  if (!user.passwordHash) {
    throw new DevBuildError(
      "Invalid credentials. Please use social login or set a password.",
      StatusCodes.UNAUTHORIZED,
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new DevBuildError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  // 4. Generate tokens
  const tokens = await createUserTokens(user);

  // 5. Return tokens and user info (excluding password)
  const { passwordHash, ...userInfo } = user;

  return {
    tokens,
    user: userInfo,
  };
};

export const FarmAdminAuthService = {
  loginFarmAdmin,

  // Forgot password flow
  async forgotPassword(email) {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new DevBuildError("User does not exist", StatusCodes.NOT_FOUND);
    }

    // 2. Verify user is FARM_ADMIN
    if (user.role !== Role.FARM_ADMIN) {
      throw new DevBuildError(
        "This endpoint is only for Farm Admins",
        StatusCodes.FORBIDDEN,
      );
    }

    // 3. Check if user is verified
    if (!user.isVerified) {
      throw new DevBuildError("User is not verified", StatusCodes.FORBIDDEN);
    }

    // 4. Reset forgotPasswordStatus and send OTP
    await prisma.user.update({
      where: { email },
      data: { forgotPasswordStatus: false },
    });

    await OtpService.sendForgotPasswordOtp(prisma, email);
    return true;
  },

  async verifyForgotPasswordOtp(email, otp) {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new DevBuildError("User does not exist", StatusCodes.NOT_FOUND);
    }

    // 2. Verify user is FARM_ADMIN
    if (user.role !== Role.FARM_ADMIN) {
      throw new DevBuildError(
        "This endpoint is only for Farm Admins",
        StatusCodes.FORBIDDEN,
      );
    }

    // 3. Verify OTP and get reset token
    const resetToken = await OtpService.verifyForgotPasswordOtp(
      prisma,
      email,
      otp,
    );

    return resetToken;
  },

  async resetPassword(userId, newPassword) {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new DevBuildError("User does not exist", StatusCodes.NOT_FOUND);
    }

    // 2. Verify user is FARM_ADMIN
    if (user.role !== Role.FARM_ADMIN) {
      throw new DevBuildError(
        "This endpoint is only for Farm Admins",
        StatusCodes.FORBIDDEN,
      );
    }

    // 3. Check forgotPasswordStatus
    if (!user.forgotPasswordStatus) {
      throw new DevBuildError(
        "Please verify your forgot password OTP first",
        StatusCodes.FORBIDDEN,
      );
    }

    // 4. Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 5. Update password and reset status
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        forgotPasswordStatus: false,
      },
    });

    return true;
  },
};
