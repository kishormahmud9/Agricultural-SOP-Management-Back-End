import prisma from "../../../prisma/client.js";
import bcrypt from "bcrypt";
import DevBuildError from "../../../lib/DevBuildError.js";
import { StatusCodes } from "http-status-codes";
import { createUserTokens } from "../../../utils/userTokenGenerator.js";
import { OtpService } from "../../otp/otp.service.js";
import { Role } from "../../../utils/role.js";

const loginEmployee = async (email, password) => {
  // 1. Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new DevBuildError("User does not exist", StatusCodes.NOT_FOUND);
  }

  // 2. Check if user has EMPLOYEE role
  if (user.role !== Role.EMPLOYEE) {
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

export const EmployeeAuthService = {
  loginEmployee,

  // Forgot password flow
  async forgotPassword(email) {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new DevBuildError("User does not exist", StatusCodes.NOT_FOUND);
    }

    // 2. Verify user is EMPLOYEE
    if (user.role !== Role.EMPLOYEE) {
      throw new DevBuildError(
        "This endpoint is only for Employees",
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

    // 2. Verify user is EMPLOYEE
    if (user.role !== Role.EMPLOYEE) {
      throw new DevBuildError(
        "This endpoint is only for Employees",
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

    // 2. Verify user is EMPLOYEE
    if (user.role !== Role.EMPLOYEE) {
      throw new DevBuildError(
        "This endpoint is only for Employees",
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

  async changePassword(userId, currentPassword, newPassword) {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new DevBuildError("User does not exist", StatusCodes.NOT_FOUND);
    }

    // 2. Verify user is EMPLOYEE
    if (user.role !== Role.EMPLOYEE) {
      throw new DevBuildError(
        "This endpoint is only for Employees",
        StatusCodes.FORBIDDEN,
      );
    }

    // 3. Check if user has a password set
    if (!user.passwordHash) {
      throw new DevBuildError(
        "No password set. Please use social login or set a password first.",
        StatusCodes.BAD_REQUEST,
      );
    }

    // 4. Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new DevBuildError(
        "Current password is incorrect",
        StatusCodes.UNAUTHORIZED,
      );
    }

    // 5. Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (isSamePassword) {
      throw new DevBuildError(
        "New password must be different from current password",
        StatusCodes.BAD_REQUEST,
      );
    }

    // 6. Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 7. Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      },
    });

    return true;
  },
};
