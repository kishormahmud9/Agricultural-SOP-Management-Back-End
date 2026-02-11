import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { notFound } from "./app/middleware/notFound.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandeler.js";
import { router } from "./app/router/index.js";
import passport from "passport";
import "./app/config/passport.config.js";
import { envVars } from "./app/config/env.js";



dotenv.config();

const app = express();

// Global middlewares
app.use(
  cors({
    origin: envVars.FRONT_END_URL, // Whitelist frontend URL from environment
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200, // Legacy browser support
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api", router);
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// 404 handler (must be after routes)
app.use(notFound);

// Global error handler (always last)
app.use(globalErrorHandler);

export default app;


