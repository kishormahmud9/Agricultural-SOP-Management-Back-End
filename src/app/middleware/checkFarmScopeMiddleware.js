import DevBuildError from "../lib/DevBuildError.js";
import { StatusCodes } from "http-status-codes";
import { Role } from "../constants/role.js";

/**
 * Ensures user can only access resources within their farm
 *
 * @param {Object} options
 * @param {string} options.farmIdSource - where to read farmId from (params | body | query)
 * @param {string} options.farmIdKey - key name for farmId (default: farmId)
 */
export const checkFarmScopeMiddleware = (
  options = { farmIdSource: "params", farmIdKey: "farmId" },
) => {
  return (req, res, next) => {
    try {
      const { farmIdSource, farmIdKey } = options;

      // User must already be attached by checkAuthMiddleware
      const user = req.user;

      if (!user) {
        throw new DevBuildError(
          "Unauthorized access",
          StatusCodes.UNAUTHORIZED,
        );
      }

      // SYSTEM_OWNER can access everything
      if (user.role === Role.SYSTEM_OWNER) {
        return next();
      }

      // Get farmId from request
      const requestedFarmId =
        req[farmIdSource]?.[farmIdKey] ||
        req.body?.[farmIdKey] ||
        req.query?.[farmIdKey];

      if (!requestedFarmId) {
        throw new DevBuildError(
          "Farm ID is required for this operation",
          StatusCodes.BAD_REQUEST,
        );
      }

      // Compare farm ownership
      if (user.farmId !== requestedFarmId) {
        throw new DevBuildError(
          "Access denied: cross-farm operation is not allowed",
          StatusCodes.FORBIDDEN,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
