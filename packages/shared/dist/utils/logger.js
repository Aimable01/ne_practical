"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logsDir = path_1.default.join(__dirname, '../../../logs');
// Ensure logs directory exists
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
const logFile = path_1.default.join(logsDir, 'app.log');
exports.logger = {
    info: (message, meta) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [INFO] ${message}${meta ? ` - ${JSON.stringify(meta)}` : ''}\n`;
        fs_1.default.appendFileSync(logFile, logMessage);
        console.log(logMessage.trim());
    },
    error: (message, error) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [ERROR] ${message}${error ? ` - ${error.message || error}` : ''}\n`;
        fs_1.default.appendFileSync(logFile, logMessage);
        console.error(logMessage.trim());
    },
    warn: (message, meta) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [WARN] ${message}${meta ? ` - ${JSON.stringify(meta)}` : ''}\n`;
        fs_1.default.appendFileSync(logFile, logMessage);
        console.warn(logMessage.trim());
    },
    debug: (message, meta) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [DEBUG] ${message}${meta ? ` - ${JSON.stringify(meta)}` : ''}\n`;
        fs_1.default.appendFileSync(logFile, logMessage);
        console.debug(logMessage.trim());
    }
};
//# sourceMappingURL=logger.js.map