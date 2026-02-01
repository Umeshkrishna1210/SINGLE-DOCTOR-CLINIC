/**
 * Centralized logging utility using Pino
 * Replaces console.log/console.error for consistent, structured logging
 */
const pino = require('pino');

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    transport: isDevelopment
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
});

module.exports = logger;
