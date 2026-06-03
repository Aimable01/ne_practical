import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import reportRoutes from "./routes/reportRoutes";
import { errorHandler, notFoundHandler, logger } from "@fe-mis/shared";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }),
);

// Routes
app.use("/reports", reportRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "report-service" });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

export default app;
