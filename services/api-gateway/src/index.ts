import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

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

// Service URLs
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  EXTINGUISHER: process.env.EXTINGUISHER_SERVICE_URL || "http://localhost:3002",
  INSPECTION: process.env.INSPECTION_SERVICE_URL || "http://localhost:3003",
  MAINTENANCE: process.env.MAINTENANCE_SERVICE_URL || "http://localhost:3004",
  REPORT: process.env.REPORT_SERVICE_URL || "http://localhost:3005",
};

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: SERVICES,
  });
});

// Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Proxy routes to services
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: SERVICES.AUTH,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
  }),
);

app.use(
  "/api/extinguishers",
  createProxyMiddleware({
    target: SERVICES.EXTINGUISHER,
    changeOrigin: true,
  }),
);

app.use(
  "/api/inspections",
  createProxyMiddleware({
    target: SERVICES.INSPECTION,
    changeOrigin: true,
  }),
);

app.use(
  "/api/maintenance",
  createProxyMiddleware({
    target: SERVICES.MAINTENANCE,
    changeOrigin: true,
  }),
);

app.use(
  "/api/reports",
  createProxyMiddleware({
    target: SERVICES.REPORT,
    changeOrigin: true,
  }),
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log("Services:", SERVICES);
});
