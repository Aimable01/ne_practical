import fs from 'fs';
import path from 'path';

const logsDir = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

export const logger = {
  info: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [INFO] ${message}${meta ? ` - ${JSON.stringify(meta)}` : ''}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.log(logMessage.trim());
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [ERROR] ${message}${error ? ` - ${error.message || error}` : ''}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.error(logMessage.trim());
  },
  warn: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [WARN] ${message}${meta ? ` - ${JSON.stringify(meta)}` : ''}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.warn(logMessage.trim());
  },
  debug: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [DEBUG] ${message}${meta ? ` - ${JSON.stringify(meta)}` : ''}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.debug(logMessage.trim());
  }
};
