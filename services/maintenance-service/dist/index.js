"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const shared_1 = require("@fe-mis/shared");
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3004;
const startServer = async () => {
    try {
        // Connect to MongoDB
        await (0, shared_1.connectDB)();
        // Start Express server
        app_1.default.listen(PORT, () => {
            shared_1.logger.info(`Maintenance Service is running on port ${PORT}`);
            shared_1.logger.info(`Health check available at http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        shared_1.logger.error("Failed to start maintenance service", error);
        process.exit(1);
    }
};
startServer();
// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
    shared_1.logger.error("Unhandled Rejection:", reason);
    process.exit(1);
});
// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    shared_1.logger.error("Uncaught Exception:", error);
    process.exit(1);
});
