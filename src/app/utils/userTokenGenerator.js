import { StatusCodes } from "http-status-codes";
import { envVars } from "../config/env.js";
import { generateToken, verifyToken } from "./jwt.js";
import DevBuildError from "../lib/DevBuildError.js";

// CREATE USER TOKENS

export const createUserTokens = (user) => {
  if (user.status && user.status !== "ACTIVE") {
    throw new DevBuildError("Account is disabled", StatusCodes.FORBIDDEN);
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
    farmId: user.farmId || null, // SYSTEM_OWNER will be null
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_SECRET_TOKEN,
    envVars.JWT_EXPIRES_IN,
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_TOKEN,
    envVars.JWT_REFRESH_EXPIRES_IN,
  );

  return { accessToken, refreshToken };
};

// CREATE NEW ACCESS TOKEN USING REFRESH TOKEN

export const createNewAccessTokenUsingRefreshToken = async (
  prisma,
  refreshToken,
) => {
  const decoded = verifyToken(refreshToken, envVars.JWT_REFRESH_TOKEN);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      role: true,
      farmId: true,
      status: true,
    },
  });

  if (!user) {
    throw new DevBuildError("User does not exist", StatusCodes.UNAUTHORIZED);
  }

  if (user.status !== "ACTIVE") {
    throw new DevBuildError("Account is disabled", StatusCodes.FORBIDDEN);
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
    farmId: user.farmId,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_SECRET_TOKEN,
    envVars.JWT_EXPIRES_IN,
  );

  return accessToken;
};
