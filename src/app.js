import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { notFound } from "./app/middleware/notFound.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandeler.js";
import { router } from "./app/router/index.js";
import ProxyRoutes from "./app/modules/shared/proxy.routes.js";
import passport from "passport";
import "./app/config/passport.config.js";
import { envVars } from "./app/config/env.js";

dotenv.config();

const app = express();

const corsOrigins = ["https://farmcheck.app", "http://localhost:5173", "*"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes("*") || corsOrigins.includes(origin)) {
        callback(null, origin ?? true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  }),
);

app.options("*", cors());

app.use(cookieParser());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(passport.initialize());

// Proxy routes for AI-generated static files (must be before /api)
app.use(ProxyRoutes);

// Routes
app.use("/api", router);
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (req, res) => {
  res.send("Agricultural SOP Management Back End is running");
});

// 404 handler (must be after routes)
app.use(notFound);

// Global error handler (always last)
app.use(globalErrorHandler);

export default app;
