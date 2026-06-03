"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.GATEWAY_PORT || 3000;
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
// Body parsing middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Service URLs
const SERVICES = {
    AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    EXTINGUISHER: process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:3002',
    INSPECTION: process.env.INSPECTION_SERVICE_URL || 'http://localhost:3003',
    MAINTENANCE: process.env.MAINTENANCE_SERVICE_URL || 'http://localhost:3004',
    REPORT: process.env.REPORT_SERVICE_URL || 'http://localhost:3005',
};
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: SERVICES
    });
});
// Proxy routes to services
app.use('/api/auth', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: SERVICES.AUTH,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
}));
app.use('/api/extinguishers', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: SERVICES.EXTINGUISHER,
    changeOrigin: true,
}));
app.use('/api/inspections', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: SERVICES.INSPECTION,
    changeOrigin: true,
}));
app.use('/api/maintenance', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: SERVICES.MAINTENANCE,
    changeOrigin: true,
}));
app.use('/api/reports', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: SERVICES.REPORT,
    changeOrigin: true,
}));
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('Services:', SERVICES);
});
