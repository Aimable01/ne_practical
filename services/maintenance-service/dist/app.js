"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const maintenanceRoutes_1 = __importDefault(require("./routes/maintenanceRoutes"));
const shared_1 = require("@fe-mis/shared");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)());
// Body parsing middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging middleware
app.use((0, morgan_1.default)("combined", {
    stream: {
        write: (message) => {
            shared_1.logger.info(message.trim());
        },
    },
}));
// Routes
app.use("/", maintenanceRoutes_1.default);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", service: "maintenance-service" });
});
// 404 handler
app.use(shared_1.notFoundHandler);
// Error handling middleware
app.use(shared_1.errorHandler);
exports.default = app;
