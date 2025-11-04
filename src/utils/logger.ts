import winston from 'winston';
import path from 'path';
import fs from 'fs';

/**
 * Logger utility using Winston
 */
class Logger {
  private logger: winston.Logger;
  private static instance: Logger;

  private constructor() {
    const logDir = 'logs';

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logLevel = process.env.LOG_LEVEL || 'info';
    const logFile =
      process.env.LOG_FILE || path.join(logDir, 'agent_framework.log');

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'agent-framework' },
      transports: [
        new winston.transports.File({ filename: logFile }),
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
        }),
      ],
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      );
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, error?: Error | Record<string, any>): void {
    this.logger.error(message, error);
  }

  public debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  public log(level: string, message: string, meta?: Record<string, any>): void {
    this.logger.log(level, message, meta);
  }
}

export const logger = Logger.getInstance();
