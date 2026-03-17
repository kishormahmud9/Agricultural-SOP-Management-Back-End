import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { envVars } from "../config/env.js";

export const checkAuthMiddleware =
  (...allowedRoles) =>
  async (req, res, next) => {
    console.log("🔥 Auth middleware hit:", req.originalUrl);

    try {
      let token = req.headers.authorization;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }

      const jwtToken = token.replace(/^Bearer\s*/i, "");
      const decoded = jwt.verify(jwtToken, envVars.JWT_SECRET_TOKEN);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { farm: true },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      if (user.farm && user.farm.status === "INACTIVE") {
        return res.status(403).json({
          success: false,
          message:
            "Your farm account has been suspended. Please contact the system owner.",
        });
      }

      req.user = user;

      // 🛑 ENFORCE SUBSCRIPTION (Skip for SYSTEM_OWNER or billing/auth routes)
      const isBillingPath = req.originalUrl.startsWith("/api/farm-admin/subscription") || 
                           req.originalUrl.startsWith("/api/farm-admin/payment");
      const isAuthPath = req.originalUrl.includes("/auth") || 
                        req.originalUrl.includes("/otp") || 
                        req.originalUrl.includes("/login");

      if (user.role !== "SYSTEM_OWNER" && user.farmId && !isBillingPath && !isAuthPath) {
        const subscription = await prisma.subscription.findUnique({
          where: { farmId: user.farmId },
        });

        const now = new Date();
        const isExpired = !subscription || 
                         subscription.status === "EXPIRED" || 
                         subscription.status === "CANCELED" || 
                         new Date(subscription.endDate) < now;

        if (isExpired) {
          return res.status(403).json({
            success: false,
            message: "Your subscription has expired. Please contact your farm administrator to renew.",
          });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
